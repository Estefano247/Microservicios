package com.backend.inventory_microservice.service;

import java.util.List;
import com.backend.inventory_microservice.dto.request.InventoryRequest;
import com.backend.inventory_microservice.dto.response.InventoryResponse;

public interface InventoryService {
    InventoryResponse createInventory(InventoryRequest request);
    InventoryResponse getInventoryById(Long id);
    InventoryResponse getInventoryByProductId(Long productId);
    List<InventoryResponse> getAllInventories();
    InventoryResponse updateInventory(Long id, InventoryRequest request);
    String reduceStock(Long inventoryId, Integer quantity);
    String addStock(Long inventoryId, Integer quantity);
    String deleteInventory(Long id);
}