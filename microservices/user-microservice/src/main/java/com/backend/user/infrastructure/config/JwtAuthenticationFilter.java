package com.backend.user.infrastructure.config;

import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.backend.user.domain.entity.User;
import com.backend.user.domain.service.JwtService;
import com.backend.user.domain.service.SessionService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final SessionService sessionService;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            if (jwt.isEmpty()) {
                setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "Token invalido");
                return;
            }
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (userDetails instanceof User user) {
                    java.time.LocalDateTime lockTime = user.getLockTime();
                    if (lockTime != null && !user.isAccountNonLocked()) {
                        long remainingMinutes = java.time.temporal.ChronoUnit.MINUTES.between(
                            java.time.LocalDateTime.now(), lockTime.plusMinutes(30));
                        setErrorResponse(HttpServletResponse.SC_FORBIDDEN, response,
                            "Cuenta bloqueada. Intente nuevamente en " + remainingMinutes + " minutos");
                        return;
                    }

                    if (!user.isEnabled()) {
                        setErrorResponse(HttpServletResponse.SC_FORBIDDEN, response, "Cuenta desactivada");
                        return;
                    }
                }

                if (!sessionService.isSessionValid(jwt)) {
                    setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "Sesion invalida o expirada. Inicia sesion nuevamente.");
                    return;
                }

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, 
                        null, 
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
            
        } catch (ExpiredJwtException e) {
            setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "El token ha expirado");
        } catch (MalformedJwtException | SignatureException e) {
            setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "Token invalido o corrupto");
        } catch (JwtException e) {
            setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "Token invalido");
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "Credenciales invalidas");
        } catch (Exception e) {
            log.error("Error inesperado procesando JWT: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
            setErrorResponse(HttpServletResponse.SC_UNAUTHORIZED, response, "Error de autenticacion");
        }
    }

    private void setErrorResponse(int status, HttpServletResponse response, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        String json = String.format("{\"error\": \"%s\", \"status\": %d}", message, status);
        response.getWriter().write(json);
    }
}
