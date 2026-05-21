package com.backend.product_microservice.client;

public record InventoryRequest(
    Long productId,
    Integer cantidad,
    Integer minStock,
    Integer maxStock,
    String ubicacion
) {}