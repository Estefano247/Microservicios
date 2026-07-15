package com.backend.user.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("User Microservice API")
                        .version("2.0.0")
                        .description("""
                                Microservicio de gestión de usuarios del ecommerce.
                                
                                Funcionalidades:
                                - Registro e inicio de sesión con JWT
                                - Gestión de perfil (datos personales, cambio de contraseña)
                                - Administración de usuarios (CRUD completo con soft-delete)
                                - Bloqueo por intentos fallidos y reactivación de cuentas
                                - Sesiones activas por dispositivo
                                """)
                        .contact(new Contact()
                                .name("Soporte Técnico")
                                .email("soporte@ecommerce.com")
                                .url("https://ecommerce.com/support"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8091")
                                .description("Local development"),
                        new Server()
                                .url("http://api-gateway:8080")
                                .description("API Gateway (Docker)")))
                .tags(List.of(
                        new Tag().name("Auth").description("Registro, inicio y cierre de sesión"),
                        new Tag().name("User Profile").description("Operaciones del propio usuario autenticado"),
                        new Tag().name("Admin Users").description("Gestión de usuarios por parte del administrador")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}