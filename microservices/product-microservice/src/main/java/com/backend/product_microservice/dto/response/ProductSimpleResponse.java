package com.backend.product_microservice.dto.response;

public record ProductSimpleResponse(
    Long id,
    String titulo,
    String isbn
) {}