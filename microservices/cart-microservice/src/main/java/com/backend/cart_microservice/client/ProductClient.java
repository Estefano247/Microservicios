package com.backend.cart_microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-microservice", path = "/api/v1/products", fallbackFactory = com.backend.cart_microservice.client.fallback.ProductClientFallbackFactory.class)
public interface ProductClient {

    @GetMapping("/{id}")
    ProductResponse getProductById(@PathVariable("id") Long id);
}