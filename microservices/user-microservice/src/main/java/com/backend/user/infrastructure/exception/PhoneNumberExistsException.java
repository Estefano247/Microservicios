package com.backend.user.infrastructure.exception;

public class PhoneNumberExistsException extends BusinessException {
    public PhoneNumberExistsException() {
        super("El número de teléfono proporcionado ya está registrado");
    }
}
