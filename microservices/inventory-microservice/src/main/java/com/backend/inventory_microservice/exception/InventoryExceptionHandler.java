package com.backend.inventory_microservice.exception;

import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.backend.ErrorResponse;
import com.backend.GlobalExceptionHandler;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.backend.inventory_microservice")
@Primary
public class InventoryExceptionHandler extends GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessExceptions(BusinessException exception) {
        Map<String, String> errors = new HashMap<>();

        String fieldName = "error";
        if (exception instanceof ResourceNotFoundException) {
            fieldName = "resource";
        } else if (exception instanceof InsufficientStockException) {
            fieldName = "stock";
        } else if (exception instanceof InvalidStockOperationException) {
            fieldName = "operation";
        } else if (exception instanceof DuplicateInventoryException) {
            fieldName = "productId";
        }

        errors.put(fieldName, exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(errors));
    }
}