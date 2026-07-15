package com.backend.product_microservice.client.fallback;

import com.backend.product_microservice.client.InventoryClient;
import com.backend.product_microservice.client.InventoryRequest;
import com.backend.product_microservice.client.InventoryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InventoryClientFallbackFactory implements FallbackFactory<InventoryClient> {

    @Override
    public InventoryClient create(Throwable cause) {
        log.warn("Circuit breaker abierto para inventory-microservice (product): {}", cause.getMessage());
        return new InventoryClient() {
            @Override
            public ResponseEntity<InventoryResponse> createInventory(InventoryRequest request) {
                log.warn("Fallback: createInventory({}) omitido", request);
                return ResponseEntity.status(503).build();
            }

            @Override
            public ResponseEntity<String> deleteInventory(Long id) {
                log.warn("Fallback: deleteInventory({}) omitido", id);
                return ResponseEntity.status(503).body("Inventory service unavailable");
            }

            @Override
            public ResponseEntity<InventoryResponse> getInventoryByProductId(Long productId) {
                log.warn("Fallback: getInventoryByProductId({}) retorna null", productId);
                return ResponseEntity.ok(new InventoryResponse(null, productId, null, 0, 0, 0, null));
            }
        };
    }
}
