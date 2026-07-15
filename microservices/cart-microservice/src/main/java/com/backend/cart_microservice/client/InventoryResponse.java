package com.backend.cart_microservice.client;

import java.time.LocalDateTime;

public record InventoryResponse(
    Long id,
    Long productId,
    Integer cantidad,
    Integer minStock,
    Integer maxStock,
    LocalDateTime fechaUltimaEntrada,
    String ubicacion
) {}