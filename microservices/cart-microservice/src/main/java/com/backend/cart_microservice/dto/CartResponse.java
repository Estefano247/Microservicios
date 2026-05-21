package com.backend.cart_microservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Respuesta completa del estado del carrito del usuario")
public record CartResponse(
    
    @Schema(example = "1", description = "ID único del carrito en la base de datos")
    Long id,
    
    @Schema(example = "2", description = "ID del usuario propietario del carrito")
    Long usuarioId,
    
    @Schema(description = "Lista de productos añadidos al carrito")
    List<CartItemResponse> items,
    
    @Schema(example = "150.75", description = "Suma total de todos los subtotales de los items")
    BigDecimal total
) {}