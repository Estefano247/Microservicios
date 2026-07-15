package com.backend.cart_microservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitud para añadir un producto al carrito")
public record AddToCartRequest(

    @Schema(example = "1", description = "ID único del producto")
    @NotNull(message = "El ID del producto es obligatorio")
    Long productoId,

    @Schema(example = "2", description = "Cantidad de unidades a comprar")
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    Integer cantidad,

    @Schema(description = "Clave de idempotencia (UUID) para evitar duplicados en la solicitud")
    String idempotencyKey
) {}