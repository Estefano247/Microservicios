package com.backend.user.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import com.backend.user.domain.entity.Role;
import com.backend.user.domain.entity.User;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Respuesta que contiene el token de acceso y datos del usuario")
public record AuthenticationResponse(
    @Schema(description = "Token JWT para autenticar peticiones posteriores", 
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    String token,
    
    @Schema(description = "Tipo de token", example = "Bearer")
    String type,
    
    @Schema(description = "Email del usuario autenticado", example = "juan@email.com")
    String email,
    
    @Schema(description = "Rol del usuario", example = "CUSTOMER")
    Role role,
    
    @Schema(description = "Mensaje adicional", example = "Login exitoso")
    String message
) {
    public static AuthenticationResponse of(String token, User user) {
        return AuthenticationResponse.builder()
                .token(token)
                .type("Bearer")
                .email(user.getEmail())
                .role(user.getRole())
                .message("Autenticación exitosa")
                .build();
    }
}