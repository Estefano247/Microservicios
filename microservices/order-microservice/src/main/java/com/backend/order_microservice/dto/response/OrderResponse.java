package com.backend.order_microservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Schema(description = "Respuesta completa de una orden")
public record OrderResponse(
    @Schema(example = "1", description = "ID único de la orden")
    Long id,

    @Schema(example = "a1b2c3d4-...", description = "Número de orden único (UUID)")
    String numeroOrden,

    @Schema(example = "1", description = "ID del usuario propietario")
    Long usuarioId,

    @Schema(description = "Lista de productos en la orden")
    List<OrderItemResponse> items,

    @Schema(example = "150.75", description = "Total de la orden")
    BigDecimal total,

    @Schema(example = "PENDIENTE", description = "Estado actual de la orden")
    String estado,

    @Schema(description = "Fecha de creación")
    Instant creadoEn,

    @Schema(example = "a1b2c3d4-...", description = "Clave de idempotencia usada al crear la orden")
    String idempotencyKey
) {}
