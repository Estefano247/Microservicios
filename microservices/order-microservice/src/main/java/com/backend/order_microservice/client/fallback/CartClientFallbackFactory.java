package com.backend.order_microservice.client.fallback;

import com.backend.order_microservice.client.CartClient;
import com.backend.order_microservice.client.CartResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;

@Component
@Slf4j
public class CartClientFallbackFactory implements FallbackFactory<CartClient> {

    @Override
    public CartClient create(Throwable cause) {
        log.warn("Circuit breaker abierto para cart-microservice (order): {}", cause.getMessage());
        return new CartClient() {
            @Override
            public CartResponse getCartByUsuario(Long usuarioId) {
                log.warn("Fallback: getCartByUsuario({}) retorna carrito vacío", usuarioId);
                return new CartResponse(null, usuarioId, Collections.emptyList(), BigDecimal.ZERO);
            }

            @Override
            public void clearCart(Long usuarioId) {
                log.warn("Fallback: clearCart({}) omitido", usuarioId);
            }
        };
    }
}
