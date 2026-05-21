package com.backend.product_microservice.exception;

public class InventoryServiceException extends BusinessException {
    public InventoryServiceException(String message) {
        super(message);
    }
}