package com.backend.product_microservice.exception;

public class AuthorHasProductsException extends BusinessException {
    public AuthorHasProductsException(Long authorId) {
        super("El autor con ID " + authorId + " tiene libros asociados y no puede eliminarse");
    }
}