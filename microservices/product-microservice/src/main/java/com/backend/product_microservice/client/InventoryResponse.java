package com.backend.product_microservice.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record InventoryResponse(
    Long id,
    Long productId,
    String productName,
    Integer cantidad,
    Integer minStock,
    Integer maxStock,
    String ubicacion
) {}