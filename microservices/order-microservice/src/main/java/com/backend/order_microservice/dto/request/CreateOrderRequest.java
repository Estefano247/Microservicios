package com.backend.order_microservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitud para crear una orden desde el carrito")
public record CreateOrderRequest(
    @Schema(example = "1", description = "ID del usuario que realiza la orden")
    @NotNull(message = "El ID del usuario es obligatorio")
    Long usuarioId
) {}
