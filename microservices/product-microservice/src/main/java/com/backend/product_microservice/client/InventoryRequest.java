package com.backend.product_microservice.client;

public record InventoryRequest(
    Long productId,
    String productName,
    Integer cantidad,
    Integer minStock,
    Integer maxStock,
    String ubicacion
) {}