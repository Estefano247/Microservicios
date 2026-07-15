package com.backend.user.application.dto.response;

import com.backend.user.domain.entity.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Datos públicos del usuario")
public class UserResponse {

    @Schema(description = "Identificador único del usuario", example = "1")
    private Long id;

    @Schema(description = "Nombre de pila", example = "Juan")
    private String name;

    @Schema(description = "Apellido", example = "Pérez")
    private String lastName;

    @Schema(description = "Correo electrónico (username de login)", example = "juan.perez@example.com")
    private String email;

    @Schema(description = "Número de teléfono", example = "946001122")
    private String phone;

    @Schema(description = "Rol del usuario", example = "CUSTOMER")
    private Role role;

    @Schema(description = "Fecha de nacimiento", example = "1990-05-15")
    private LocalDate birthday;

    @Schema(description = "Indica si el email ha sido verificado", example = "true")
    private Boolean emailVerified;

    @Schema(description = "Fecha de creación de la cuenta", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Último inicio de sesión", example = "2025-06-01T08:15:00")
    private LocalDateTime lastLogin;

    @Schema(description = "Indica si el usuario está activo", example = "true")
    private Boolean enabled;
}