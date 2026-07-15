package com.backend.product_microservice.dto.request;

import com.backend.product_microservice.entity.Category;
import com.backend.product_microservice.entity.ProductType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Datos para crear o actualizar un producto")
public record ProductRequest(
    @Schema(description = "ISBN del libro", example = "9783161484100", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "El ISBN es obligatorio")
    @Pattern(regexp = "^(?:\\d{9}[\\dX]|\\d{13})$", message = "ISBN debe tener 10 o 13 dígitos")
    String isbn,

    @Schema(description = "Título del libro", example = "Cien años de soledad", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 1, max = 200)
    String titulo,

    @Schema(description = "Descripción breve", example = "Obra maestra de la literatura universal")
    @Size(max = 1000)
    String descripcion,

    @Schema(description = "Precio en soles", example = "45.90", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a cero")
    Double precio,

    @Schema(description = "Número de páginas", example = "496")
    @Min(value = 1, message = "Debe tener al menos 1 página")
    Integer paginas,

    @Schema(description = "Año de publicación", example = "1967")
    @Min(value = 1000, message = "Año inválido")
    @Max(value = 2100, message = "Año inválido")
    Integer anioPublicacion,

    @Schema(description = "Stock inicial", example = "100", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El stock inicial es obligatorio")
    Integer initialStock,

    @Schema(description = "Categoría del libro", example = "NOVELA", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "La categoría es obligatoria")
    Category categoria,

    @Schema(description = "Tipo de producto", example = "FISICO", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El tipo es obligatorio")
    ProductType tipo,

    @Schema(description = "URL de la imagen del libro", example = "https://link-de-la-imagen.com/foto.jpg")
    String imageUrl,

    @Schema(description = "ID del autor (debe existir previamente)", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El ID del autor es obligatorio")
    Long authorId,

    @Schema(description = "ID del inventario (opcional, se asignará después)", example = "100")
    Long inventarioId
) {}