package com.backend.product_microservice.dto.response;

import java.util.List;

import com.backend.product_microservice.entity.Author;

public record AuthorResponse(
    Long id,
    String nombre,
    Integer anioNacimiento,
    Integer anioDefuncion,
    String paisOrigen,
    String sexo,
    List<ProductSimpleResponse> libros
) {
    public static AuthorResponse of(Author author, List<ProductSimpleResponse> libros) {
        return new AuthorResponse(
            author.getId(),
            author.getNombre(),
            author.getAnioNacimiento(),
            author.getAnioDefuncion(),
            author.getPaisOrigen(),
            author.getSexo(),
            libros
        );
    }
}