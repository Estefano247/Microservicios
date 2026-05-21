package com.backend;

import java.util.HashMap;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Component
@RestControllerAdvice   
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // NOTE: FeignException handler is shared across all microservices via common-exception module.
    // It handles Feign client errors when any microservice that depends on this module uses OpenFeign.
    // This microservice (user-microservice) may not use Feign directly, but others might.
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorResponse> handleFeignException(FeignException ex) {
        log.error("Error de comunicacion con servicio externo: status={}, uri={}", ex.status(), ex.hasRequest() ? ex.request().url() : "unknown");
        var errors = new HashMap<String, String>();
        errors.put("servicio_externo", "Error de comunicacion con el microservicio dependiente");
        errors.put("status", String.valueOf(ex.status()));
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(errors));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleException(MethodArgumentNotValidException exception) {
        var errors = new HashMap<String, String>();
        exception.getBindingResult().getFieldErrors().forEach((error) -> {
            var fieldName = ((FieldError) error).getField();
            var errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(errors));
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception) {
        log.error("Error inesperado no manejado: {}", exception.getMessage(), exception);
        var errors = new HashMap<String, String>();
        var fieldName = "message";
        var errorMessage = "Se ha producido un error inesperado. Por favor, intentelo de nuevo mas tarde.";
        errors.put(fieldName, errorMessage);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(errors));
    }

}
