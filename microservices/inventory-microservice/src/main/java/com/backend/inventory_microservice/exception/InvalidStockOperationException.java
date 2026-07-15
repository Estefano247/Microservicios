package com.backend.inventory_microservice.exception;

public class InvalidStockOperationException extends BusinessException {
    public InvalidStockOperationException(String message) {
        super(message);
    }
}