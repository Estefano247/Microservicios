package com.backend.order_microservice.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record InventoryResponse(
    Long id,
    Long productId,
    Integer cantidad,
    Integer minStock,
    Integer maxStock,
    String ubicacion
) {}
