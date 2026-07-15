package com.backend.order_microservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Detalle de un producto dentro de la orden")
public record OrderItemResponse(
    @Schema(example = "101", description = "ID del producto")
    Long productoId,

    @Schema(example = "Cien años de soledad", description = "Título del producto")
    String titulo,

    @Schema(example = "2", description = "Cantidad de unidades")
    Integer cantidad,

    @Schema(example = "25.50", description = "Precio unitario al momento de la compra")
    BigDecimal precioCaptura,

    @Schema(example = "51.00", description = "Subtotal (cantidad * precioCaptura)")
    BigDecimal subtotal
) {}
