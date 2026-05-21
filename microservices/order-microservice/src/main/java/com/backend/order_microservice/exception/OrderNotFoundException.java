package com.backend.order_microservice.exception;

public class OrderNotFoundException extends BusinessException {
    public OrderNotFoundException(String message) {
        super(message);
    }
}
