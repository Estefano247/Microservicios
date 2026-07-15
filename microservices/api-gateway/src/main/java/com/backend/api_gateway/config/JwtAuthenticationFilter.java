package com.backend.api_gateway.config;

import java.security.Key;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if ((token == null || token.isEmpty()) && path.startsWith("/analytics")) {
            token = exchange.getRequest().getQueryParams().getFirst("token");
        }

        if (token == null || token.isEmpty()) {
            return chain.filter(exchange);
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

        } catch (Exception e) {
            log.debug("JWT validation failed, continuing without auth: {}", e.getMessage());
            return chain.filter(exchange);
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
}
