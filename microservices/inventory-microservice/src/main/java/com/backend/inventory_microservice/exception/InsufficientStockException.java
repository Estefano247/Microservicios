package com.backend.inventory_microservice.exception;

public class InsufficientStockException extends BusinessException {
    public InsufficientStockException(Long inventoryId, Integer requested, Integer available) {
        super("Stock insuficiente para el inventario ID " + inventoryId + 
              ". Solicitado: " + requested + ", disponible: " + available);
    }
}