package com.backend.product_microservice.exception;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Primary;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.backend.ErrorResponse;
import com.backend.GlobalExceptionHandler;

@RestControllerAdvice(basePackages = "com.backend.product_microservice")
@Primary
public class ProductExceptionHandler extends GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessExceptions(BusinessException exception) {
        Map<String, String> errors = new HashMap<>();

        String fieldName = "error";
        if (exception instanceof ResourceNotFoundException) {
            fieldName = "resource";
        } else if (exception instanceof DuplicateIsbnException) {
            fieldName = "isbn";
        } else if (exception instanceof AuthorHasProductsException) {
            fieldName = "author";
        } else if (exception instanceof InventoryServiceException) {
            fieldName = "inventory";
        }

        errors.put(fieldName, exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(errors));
    }
}