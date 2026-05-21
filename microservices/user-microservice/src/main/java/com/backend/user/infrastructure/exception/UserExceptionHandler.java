package com.backend.user.infrastructure.exception;

import com.backend.ErrorResponse;
import com.backend.GlobalExceptionHandler;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.backend.user")
@Primary
public class UserExceptionHandler extends GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", "No tienes permisos para realizar esta acción");
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(errors));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessExceptions(BusinessException exception) {
        Map<String, String> errors = new HashMap<>();
        
        // Determinamos qué "campo" causó el error para que el frontend sepa dónde mostrarlo
        String fieldName = "error"; 
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (exception instanceof EmailAlreadyExistsException) {
            fieldName = "email";
            status = HttpStatus.CONFLICT;
        } else if (exception instanceof UserNotFoundException) {
            fieldName = "user";
            status = HttpStatus.NOT_FOUND;
        } else if (exception instanceof PhoneNumberExistsException) {
            fieldName = "phone";
            status = HttpStatus.CONFLICT;
        } else if (exception instanceof UnderageException) {
            fieldName = "age";
        } else if (exception instanceof PasswordMismatchException || exception instanceof InvalidCurrentPasswordException) {
            fieldName = "password";
        }

        errors.put(fieldName, exception.getMessage());
        
        return ResponseEntity
                .status(status)
                .body(new ErrorResponse(errors));
    }
}