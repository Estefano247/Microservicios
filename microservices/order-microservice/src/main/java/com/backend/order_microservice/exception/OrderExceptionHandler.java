package com.backend.order_microservice.exception;

import com.backend.ErrorResponse;
import com.backend.GlobalExceptionHandler;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.backend.order_microservice")
@Primary
public class OrderExceptionHandler extends GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessExceptions(BusinessException exception) {
        Map<String, String> errors = new HashMap<>();
        String fieldName = "error";

        if (exception instanceof OrderNotFoundException) {
            fieldName = "order";
        } else if (exception instanceof InvalidOrderStatusException) {
            fieldName = "estado";
        }

        errors.put(fieldName, exception.getMessage());

        HttpStatus status = (exception instanceof OrderNotFoundException)
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(new ErrorResponse(errors));
    }
}
