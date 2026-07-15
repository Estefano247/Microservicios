package com.backend.order_microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "cart-microservice", path = "/api/v1/cart", fallbackFactory = com.backend.order_microservice.client.fallback.CartClientFallbackFactory.class)
public interface CartClient {

    @GetMapping("/usuario/{usuarioId}")
    CartResponse getCartByUsuario(@PathVariable("usuarioId") Long usuarioId);

    @DeleteMapping("/usuario/{usuarioId}")
    void clearCart(@PathVariable("usuarioId") Long usuarioId);
}
