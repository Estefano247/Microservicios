package com.backend.cart_microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-microservice", path = "/api/v1/inventory")
public interface InventoryClient {

    @GetMapping("/product/{productId}")
    InventoryResponse getInventoryByProductId(@PathVariable("productId") Long productId);

    // Se exponen los endpoints para modificar stock, que usa el carrito y otros servicios
    @PatchMapping("/{id}/reduce")
    String reduceStock(@PathVariable("id") Long id, @RequestParam Integer quantity);

    @PatchMapping("/{id}/add")
    String addStock(@PathVariable("id") Long id, @RequestParam Integer quantity);
}