package com.backend.user.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Solicitud de cambio de contraseña para el usuario autenticado")
public record ChangePasswordRequest(

    @Schema(description = "Contraseña actual del usuario", example = "MiVieja@Pass1")
    @NotBlank
    String currentPassword,

    @Schema(description = "Nueva contraseña (mín. 8 caracteres, mayúscula, minúscula, número y carácter especial)",
            example = "MiNueva@Pass1")
    @NotBlank
    @Size(min = 8, max = 128)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,128}$",
             message = "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial")
    String newPassword,

    @Schema(description = "Confirmación de la nueva contraseña (debe coincidir con newPassword)",
            example = "MiNueva@Pass1")
    @NotBlank
    String confirmPassword
) {
    public boolean isNewPasswordMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}