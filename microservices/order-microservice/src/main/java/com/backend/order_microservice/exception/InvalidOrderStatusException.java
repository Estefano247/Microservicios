package com.backend.order_microservice.exception;

public class InvalidOrderStatusException extends BusinessException {
    public InvalidOrderStatusException(String message) {
        super(message);
    }
}
