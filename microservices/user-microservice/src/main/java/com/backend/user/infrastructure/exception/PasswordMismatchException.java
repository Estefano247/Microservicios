package com.backend.user.infrastructure.exception;

public class PasswordMismatchException extends BusinessException {
    public PasswordMismatchException() {
        super("Las contraseñas no coinciden");
    }
}