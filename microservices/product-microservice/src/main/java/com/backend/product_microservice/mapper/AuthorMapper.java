package com.backend.product_microservice.mapper;

import com.backend.product_microservice.dto.request.AuthorRequest;
import com.backend.product_microservice.dto.response.AuthorResponse;
import com.backend.product_microservice.dto.response.AuthorSimpleResponse;
import com.backend.product_microservice.dto.response.ProductSimpleResponse;
import com.backend.product_microservice.entity.Author;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AuthorMapper {

    public Author toEntity(AuthorRequest request) {
        if (request == null) return null;
        return Author.builder()
            .nombre(request.nombre())
            .anioNacimiento(request.anioNacimiento())
            .anioDefuncion(request.anioDefuncion())
            .paisOrigen(request.paisOrigen())
            .sexo(request.sexo())
            .idempotencyKey(request.idempotencyKey())
            .build();
    }

    public AuthorResponse toResponse(Author author) {
        if (author == null) return null;
        
        List<ProductSimpleResponse> libros = (author.getLibros() == null) 
            ? Collections.emptyList()
            : author.getLibros().stream()
                .map(p -> new ProductSimpleResponse(p.getId(), p.getTitulo(), p.getIsbn()))
                .collect(Collectors.toList());
                
        return AuthorResponse.of(author, libros);
    }

    public AuthorSimpleResponse toSimpleResponse(Author author) {
        if (author == null) return null;
        return new AuthorSimpleResponse(author.getId(), author.getNombre());
    }

    public void updateEntity(Author author, AuthorRequest request) {
        if (request == null) return;
        author.setNombre(request.nombre());
        author.setAnioNacimiento(request.anioNacimiento());
        author.setAnioDefuncion(request.anioDefuncion());
        author.setPaisOrigen(request.paisOrigen());
        author.setSexo(request.sexo());
    }
}