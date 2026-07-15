package com.backend.product_microservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Datos para crear un autor")
public record AuthorRequest(
    @NotBlank @Size(min=2, max=100) String nombre,
    @Min(1000) @Max(2100) Integer anioNacimiento,
    @Min(1000) @Max(2100) Integer anioDefuncion,
    @Size(max=50) String paisOrigen,
    @Size(max=20) String sexo,
    @Schema(description = "Clave de idempotencia (UUID) para evitar duplicados")
    String idempotencyKey
) {}
