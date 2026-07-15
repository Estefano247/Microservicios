package com.backend.order_microservice.client.fallback;

import java.util.Map;
import com.backend.order_microservice.client.InventoryClient;
import com.backend.order_microservice.client.InventoryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InventoryClientFallbackFactory implements FallbackFactory<InventoryClient> {

    @Override
    public InventoryClient create(Throwable cause) {
        log.warn("Circuit breaker abierto para inventory-microservice (order): {}", cause.getMessage());
        return new InventoryClient() {
            @Override
            public InventoryResponse getInventoryByProductId(Long productId) {
                return new InventoryResponse(null, productId, 0, 0, 0, null);
            }

            @Override
            public Map<String, String> reduceStock(Long id, Integer quantity) {
                log.warn("Fallback: reduceStock({}, {}) omitido", id, quantity);
                return Map.of("message", "Stock reduction skipped (circuit breaker)");
            }

            @Override
            public Map<String, String> addStock(Long id, Integer quantity) {
                log.warn("Fallback: addStock({}, {}) omitido", id, quantity);
                return Map.of("message", "Stock add skipped (circuit breaker)");
            }

            @Override
            public InventoryResponse getInventoryById(Long id) {
                return new InventoryResponse(id, null, 0, 0, 0, null);
            }
        };
    }
}
