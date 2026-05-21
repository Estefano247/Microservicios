package com.backend.product_microservice.mapper;
import com.backend.product_microservice.dto.request.CreateProductRequest;
import com.backend.product_microservice.dto.request.UpdateProductRequest;
import com.backend.product_microservice.dto.response.ProductResponse;
import com.backend.product_microservice.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final AuthorMapper authorMapper;  // CORREGIDO: se inyecta

    public Product toEntity(CreateProductRequest request) {
        return Product.builder()
            .isbn(request.isbn())
            .titulo(request.titulo())
            .descripcion(request.descripcion())
            .precio(BigDecimal.valueOf(request.precio()))
            .paginas(request.paginas())
            .anioPublicacion(request.anioPublicacion())
            .imageUrl(request.imageUrl())
            .categoria(request.categoria())
            .tipo(request.tipo())
            .isActive(true)
            .build();
    }

    public ProductResponse toResponse(Product product) {
        if (product == null) return null;
        return new ProductResponse(
            product.getId(), product.getIsbn(), product.getTitulo(),
            product.getDescripcion(), product.getPrecio().doubleValue(),
            product.getPaginas(), product.getAnioPublicacion(),
            product.getCategoria(), product.getTipo(),
            authorMapper.toSimpleResponse(product.getAuthor()),  // CORREGIDO
            product.getInventarioId(), product.getIsActive()
        );
    }

    public void updateEntity(Product product, UpdateProductRequest request) {
        product.setIsbn(request.isbn());
        product.setTitulo(request.titulo());
        product.setDescripcion(request.descripcion());
        product.setPrecio(BigDecimal.valueOf(request.precio()));
        product.setPaginas(request.paginas());
        product.setAnioPublicacion(request.anioPublicacion());
        product.setImageUrl(request.imageUrl());
        product.setCategoria(request.categoria());
        product.setTipo(request.tipo());
    }
}