package com.backend.product_microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.retry.annotation.Retryable;

@FeignClient(name = "inventory-microservice", path = "/api/v1/inventory", fallbackFactory = com.backend.product_microservice.client.fallback.InventoryClientFallbackFactory.class)
public interface InventoryClient {

    @PostMapping
    @Retryable(maxAttempts = 2)
    ResponseEntity<InventoryResponse> createInventory(@RequestBody InventoryRequest request);

    @DeleteMapping("/{id}")
    ResponseEntity<String> deleteInventory(@PathVariable("id") Long id);

    @GetMapping("/product/{productId}")
    ResponseEntity<InventoryResponse> getInventoryByProductId(@PathVariable("productId") Long productId);
}