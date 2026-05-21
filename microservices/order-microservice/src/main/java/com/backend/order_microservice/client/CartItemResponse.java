package com.backend.order_microservice.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CartItemResponse(
    Long productoId,
    String titulo,
    Integer cantidad,
    BigDecimal precioUnitario,
    BigDecimal subtotal
) {}
