package com.backend.cart_microservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Detalle de un producto individual dentro del carrito")
public record CartItemResponse(
    
    @Schema(example = "101", description = "ID del producto (Libro)")
    Long productoId,
    
    @Schema(example = "El Quijote de la Mancha", description = "Título del producto capturado al momento de añadir")
    String titulo,
    
    @Schema(example = "2", description = "Cantidad de unidades seleccionadas")
    Integer cantidad,
    
    @Schema(example = "25.50", description = "Precio unitario del producto en el momento de la consulta")
    BigDecimal precioUnitario,
    
    @Schema(example = "51.00", description = "Subtotal calculado (cantidad * precioUnitario)")
    BigDecimal subtotal
) {}