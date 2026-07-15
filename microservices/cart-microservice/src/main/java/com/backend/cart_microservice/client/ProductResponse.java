package com.backend.cart_microservice.client;

import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String titulo,
    BigDecimal precio,
    String imageUrl,
    Long inventarioId
) {}