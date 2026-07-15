package com.backend.inventory_microservice.exception;

public class DuplicateInventoryException extends BusinessException {
    public DuplicateInventoryException(Long productId) {
        super("Ya existe un registro de inventario para el producto con ID: " + productId);
    }
}