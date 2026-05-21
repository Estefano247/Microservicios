package com.backend.product_microservice.exception;

public class DuplicateIsbnException extends BusinessException {
    public DuplicateIsbnException(String isbn) {
        super("El ISBN " + isbn + " ya está registrado");
    }
}