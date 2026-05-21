package com.backend.product_microservice.dto.response;

import com.backend.product_microservice.entity.Category;
import com.backend.product_microservice.entity.ProductType;

public record ProductResponse(
    Long id, 
    String isbn, 
    String titulo, 
    String descripcion,                              
    Double precio, 
    Integer paginas, 
    Integer anioPublicacion,                              
    Category categoria, 
    ProductType tipo,
    AuthorSimpleResponse autor, 
    Long inventarioId, 
    Boolean isActive
) {}