package com.backend.api_gateway.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Autowired
    private JwtSecurityContextRepository jwtSecurityContextRepository;

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
            .securityContextRepository(jwtSecurityContextRepository)
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(
                    "/api/v1/users/auth",
                    "/api/v1/users/auth/login",
                    "/api/v1/users/auth/logout",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/user-docs/**",
                    "/product-docs/**",
                    "/inventory-docs/**",
                    "/cart-docs/**",
                    "/order-docs/**",
                    "/health/**",
                    "/actuator/**"
                ).permitAll()
                .pathMatchers(HttpMethod.GET,
                    "/api/v1/products/**",
                    "/api/v1/authors/**",
                    "/api/v1/inventory/**"
                ).permitAll()
                .pathMatchers("/api/v1/users/admin/**").hasRole("ADMIN")
                .pathMatchers("/api/v1/cart/admin/**").hasRole("ADMIN")
                .anyExchange().authenticated()
            )
            // 401 sin cabecera "WWW-Authenticate: Basic": evita que el navegador
            // muestre su propio cuadro de login. El frontend maneja el 401.
            .exceptionHandling(ex -> ex.authenticationEntryPoint((exchange, e) -> {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }))
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        if ("*".equals(allowedOrigins)) {
            config.addAllowedOriginPattern("*");
        } else {
            config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}