package com.backend.user.infrastructure.exception;

public class UnderageException extends BusinessException {
    public UnderageException() {
        super("Debes ser mayor de 18 años");
    }
}