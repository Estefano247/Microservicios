package com.backend.user.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Credenciales para iniciar sesión")
public record LoginRequest(
    
    @Schema(example = "juan.perez@example.com", description = "Email registrado del usuario")
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    String email,

    @Schema(example = "SecureP@ss123", description = "Contraseña del usuario")
    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {}