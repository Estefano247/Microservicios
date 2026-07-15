package com.backend.order_microservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitud para crear una orden desde el carrito")
public record CreateOrderRequest(
    @Schema(example = "1", description = "ID del usuario que realiza la orden")
    @NotNull(message = "El ID del usuario es obligatorio")
    Long usuarioId,

    @Schema(example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            description = "Clave de idempotencia (UUID). Si se re-envia la misma clave, se retorna la orden existente sin duplicar.")
    String idempotencyKey
) {}
