package com.backend.order_microservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Solicitud para actualizar el estado de una orden")
public record UpdateOrderStatusRequest(
    @Schema(example = "COMPLETADO", description = "Nuevo estado de la orden")
    @NotBlank(message = "El estado es obligatorio")
    String estado
) {}
