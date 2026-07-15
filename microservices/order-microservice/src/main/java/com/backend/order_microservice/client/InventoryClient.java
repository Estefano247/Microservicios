package com.backend.order_microservice.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-microservice", path = "/api/v1/inventory", fallbackFactory = com.backend.order_microservice.client.fallback.InventoryClientFallbackFactory.class)
public interface InventoryClient {

    @GetMapping("/product/{productId}")
    InventoryResponse getInventoryByProductId(@PathVariable("productId") Long productId);

    @PatchMapping("/{id}/reduce")
    Map<String, String> reduceStock(@PathVariable("id") Long id, @RequestParam Integer quantity);

    @PatchMapping("/{id}/add")
    Map<String, String> addStock(@PathVariable("id") Long id, @RequestParam Integer quantity);

    @GetMapping("/{id}")
    InventoryResponse getInventoryById(@PathVariable("id") Long id);
}
