package com.backend.order_microservice.client.fallback;

import com.backend.order_microservice.client.ProductClient;
import com.backend.order_microservice.client.ProductResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
public class ProductClientFallbackFactory implements FallbackFactory<ProductClient> {

    @Override
    public ProductClient create(Throwable cause) {
        log.warn("Circuit breaker abierto para product-microservice (order): {}", cause.getMessage());
        return productId -> {
            log.warn("Fallback: getProductById({}) retorna producto vacío", productId);
            return new ProductResponse(productId, "Producto no disponible", BigDecimal.ZERO, null, null);
        };
    }
}
