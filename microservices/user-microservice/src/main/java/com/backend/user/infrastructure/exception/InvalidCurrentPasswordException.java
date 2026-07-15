package com.backend.user.infrastructure.exception;

public class InvalidCurrentPasswordException extends BusinessException {
    public InvalidCurrentPasswordException() {
        super("La contraseña actual es incorrecta");
    }
}