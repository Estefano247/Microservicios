package com.backend.order_microservice.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CartResponse(
    Long id,
    Long usuarioId,
    List<CartItemResponse> items,
    BigDecimal total
) {}
