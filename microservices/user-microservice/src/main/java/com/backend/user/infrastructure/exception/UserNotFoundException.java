package com.backend.user.infrastructure.exception;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(Long userId) {
        super("Usuario con ID " + userId + " no encontrado");
    }

    public UserNotFoundException(String email) {
        super("Usuario con email " + email + " no encontrado");
    }
}