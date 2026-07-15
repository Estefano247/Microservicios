package com.backend.product_microservice.service;
import com.backend.product_microservice.dto.request.CreateProductRequest;
import com.backend.product_microservice.dto.request.UpdateProductRequest;
import com.backend.product_microservice.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllProducts(String categoria, String tipo, Long authorId, String titulo, Pageable pageable);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    void deleteProduct(Long id);
}