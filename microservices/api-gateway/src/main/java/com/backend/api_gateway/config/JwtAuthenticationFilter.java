package com.backend.api_gateway.config;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

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
@Order(-1)
@Slf4j
public class JwtAuthenticationFilter implements WebFilter {

    @Value("${jwt.secret.key}")
    private String secretKey;

    private static final Set<String> EXACT_PUBLIC_PATHS = Set.of(
        "/api/v1/users/auth",
        "/api/v1/users/auth/login",
        "/api/v1/users/auth/logout"
    );

    private static final Set<String> PREFIX_PUBLIC_PATHS = Set.of(
        "/analytics",
        "/swagger-ui",
        "/v3/api-docs",
        "/health",
        "/actuator",
        "/user-docs",
        "/product-docs",
        "/inventory-docs",
        "/cart-docs",
        "/order-docs"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();

        if (isPublicPath(path, method)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return sendUnauthorized(exchange, "Authorization header missing or invalid");
        }

        String token = authHeader.substring(7);

        if (token.isEmpty()) {
            return sendUnauthorized(exchange, "Token is empty");
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

            log.debug("JWT validated for user={} role={}", email, role);
            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
            return sendUnauthorized(exchange, "Token expired");
        } catch (MalformedJwtException | SignatureException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return sendUnauthorized(exchange, "Invalid token");
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return sendUnauthorized(exchange, "Token validation failed");
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

    private boolean isPublicPath(String path, String method) {
        if (EXACT_PUBLIC_PATHS.contains(path)) {
            return true;
        }
        if (PREFIX_PUBLIC_PATHS.stream().anyMatch(path::startsWith)) {
            return true;
        }
        if ("GET".equals(method) && (path.startsWith("/api/v1/products") || path.startsWith("/api/v1/authors"))) {
            return true;
        }
        return false;
    }

    private Mono<Void> sendUnauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format("{\"error\": \"%s\", \"status\": 401}", message);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(
            Mono.just(exchange.getResponse().bufferFactory().wrap(bytes))
        );
    }
}
