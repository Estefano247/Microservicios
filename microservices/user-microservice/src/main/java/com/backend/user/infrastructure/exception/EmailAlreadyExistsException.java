package com.backend.user.infrastructure.exception;

public class EmailAlreadyExistsException extends BusinessException {
    public EmailAlreadyExistsException() {
        super("El email proporcionado ya está registrado");
    }
}