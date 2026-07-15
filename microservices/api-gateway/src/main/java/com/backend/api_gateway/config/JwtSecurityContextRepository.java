package com.backend.api_gateway.config;

import java.security.Key;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class JwtSecurityContextRepository implements ServerSecurityContextRepository {

    @Value("${jwt.secret.key}")
    private String secretKey;

    @Override
    public Mono<Void> save(ServerWebExchange exchange, SecurityContext context) {
        return Mono.empty();
    }

    @Override
    public Mono<SecurityContext> load(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null || token.isEmpty()) {
            token = exchange.getRequest().getQueryParams().getFirst("token");
        }

        if (token == null || token.isEmpty()) {
            return Mono.empty();
        }

        try {
            Claims claims = parseToken(token);

            Object userIdObj = claims.get("userId");
            String userId = userIdObj != null ? userIdObj.toString() : null;
            String role = claims.get("role", String.class);
            String email = claims.getSubject();
            String fullName = claims.get("fullName", String.class);
            Boolean emailVerified = claims.get("emailVerified", Boolean.class);

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId != null ? userId : "unknown")
                .header("X-User-Role", role != null ? role : "ROLE_CUSTOMER")
                .header("X-User-Email", email != null ? email : "unknown")
                .header("X-User-FullName", fullName != null ? fullName : "")
                .header("X-User-Email-Verified", emailVerified != null ? emailVerified.toString() : "false")
                .build();

            exchange = exchange.mutate().request(mutatedRequest).build();

            String roleAuthority = role != null ? role.toUpperCase() : "ROLE_CUSTOMER";

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                email, null, List.of(new SimpleGrantedAuthority(roleAuthority)));

            log.debug("JWT validated for user={} role={}", email, role);

            SecurityContext context = new SecurityContextImpl(auth);
            return Mono.just(context);

        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
            return Mono.empty();
        } catch (MalformedJwtException | SignatureException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return Mono.empty();
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return Mono.empty();
        }
    }

    private Claims parseToken(String token) {
        Key key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
