package com.backend.inventory_microservice.service.impl;

import com.backend.inventory_microservice.dto.request.InventoryRequest;
import com.backend.inventory_microservice.dto.response.InventoryResponse;
import com.backend.inventory_microservice.entity.Inventory;
import com.backend.inventory_microservice.exception.*;
import com.backend.inventory_microservice.repository.InventoryRepository;
import com.backend.inventory_microservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        // Validar que no exista ya un inventario para ese producto
        if (inventoryRepository.findByProductoId(request.productId()).isPresent()) {
            throw new DuplicateInventoryException(request.productId());
        }

        Inventory inventory = Inventory.builder()
                .productoId(request.productId())
                .cantidad(request.cantidad())
                .minStock(request.minStock() != null ? request.minStock() : 0)
                .maxStock(request.maxStock() != null ? request.maxStock() : 100)
                .ubicacion(request.ubicacion())
                .fechaUltimaEntrada(LocalDateTime.now())
                .build();

        inventory = inventoryRepository.save(inventory);
        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse getInventoryById(Long id) {
        Inventory inventory = findByIdOrThrow(id);
        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductoId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró inventario para el producto ID: " + productId));
        return mapToResponse(inventory);
    }

    @Override
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(Long id, InventoryRequest request) {
        Inventory inventory = findByIdOrThrow(id);

        // Si se cambia el productId, verificar que no haya otro con ese productId
        if (!inventory.getProductoId().equals(request.productId())) {
            if (inventoryRepository.findByProductoId(request.productId()).isPresent()) {
                throw new DuplicateInventoryException(request.productId());
            }
            inventory.setProductoId(request.productId());
        }

        inventory.setCantidad(request.cantidad());
        inventory.setMinStock(request.minStock() != null ? request.minStock() : inventory.getMinStock());
        inventory.setMaxStock(request.maxStock() != null ? request.maxStock() : inventory.getMaxStock());
        inventory.setUbicacion(request.ubicacion() != null ? request.ubicacion() : inventory.getUbicacion());
        // No actualizamos fechaUltimaEntrada aquí, eso ocurre en operaciones de stock

        inventory = inventoryRepository.save(inventory);
        return mapToResponse(inventory);
    }

    @Override
    @Transactional
    public String reduceStock(Long inventoryId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new InvalidStockOperationException("La cantidad a reducir debe ser positiva");
        }

        Inventory inventory = findByIdWithLockOrThrow(inventoryId);

        if (inventory.getCantidad() < quantity) {
            throw new InsufficientStockException(inventoryId, quantity, inventory.getCantidad());
        }

        inventory.setCantidad(inventory.getCantidad() - quantity);
        return "Stock modificado: Se han reducido " + quantity + " unidades. Stock actual: " + inventory.getCantidad();
    }

    @Override
    @Transactional
    public String addStock(Long inventoryId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new InvalidStockOperationException("La cantidad a agregar debe ser positiva");
        }

        Inventory inventory = findByIdWithLockOrThrow(inventoryId);
        inventory.setCantidad(inventory.getCantidad() + quantity);
        inventory.setFechaUltimaEntrada(LocalDateTime.now());
        
        return "Stock modificado: Se han agregado " + quantity + " unidades. Stock actual: " + inventory.getCantidad();
    }

    @Override
    @Transactional
    public String deleteInventory(Long id) {
        Inventory inventory = findByIdOrThrow(id);
        inventoryRepository.delete(inventory);
        return "Inventario con ID " + id + " eliminado exitosamente";
    }

    private Inventory findByIdOrThrow(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado con id: " + id));
    }

    private Inventory findByIdWithLockOrThrow(Long id) {
        return inventoryRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado con id: " + id));
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProductoId(),
                inventory.getCantidad(),
                inventory.getMinStock(),
                inventory.getMaxStock(),
                inventory.getFechaUltimaEntrada(),
                inventory.getUbicacion()
        );
    }
}
