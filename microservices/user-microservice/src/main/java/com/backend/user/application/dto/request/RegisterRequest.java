package com.backend.user.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos necesarios para registrar un nuevo usuario")
public class RegisterRequest {
    
    @Schema(example = "Juan", description = "Nombre de pila")
    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String name;

    @Schema(example = "Pérez", description = "Apellido paterno o completo")
    @NotNull(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    private String lastName;

    @Schema(example = "juan.perez@example.com")
    @NotNull(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;
    
    @Schema(example = "SecureP@ss123", description = "Debe incluir mayúscula, minúscula, número y carácter especial")
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 128, message = "La contraseña debe tener entre 8 y 128 caracteres")    
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,128}$",
                message = "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial")
    private String password;    
    
    @Schema(example = "SecureP@ss123", description = "Debe coincidir con el campo password")
    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    private String confirmPassword;
    
    @Schema(example = "946001122", description = "Teléfono de Perú")
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "El teléfono no es válido")    
    private String phone;

    @Schema(example = "1990-05-15", description = "Fecha de nacimiento (opcional)")
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private LocalDate birthday;
    
    public boolean isPasswordMatch() {
        return password != null && password.equals(confirmPassword);
    }
}