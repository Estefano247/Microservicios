package com.backend.product_microservice.dto.request;

import com.backend.product_microservice.entity.Category;
import com.backend.product_microservice.entity.ProductType;
import jakarta.validation.constraints.*;

public record UpdateProductRequest(
    @NotBlank @Pattern(regexp = "^(?:\\d{9}[\\dX]|\\d{13})$") String isbn,
    @NotBlank @Size(max=200) String titulo,
    @Size(max=1000) String descripcion,
    @NotNull @Positive Double precio,
    @Min(1) Integer paginas,
    @Min(1450) @Max(2100) Integer anioPublicacion,
    @NotNull Category categoria,
    @NotNull ProductType tipo,
    @Size(max=512) String imageUrl,
    Long authorId
) {}