package com.backend.inventory_microservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear o actualizar un registro de inventario")
public record InventoryRequest(
    @Schema(description = "ID del producto asociado", example = "10", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El ID del producto es obligatorio")
    Long productId,

    @Schema(description = "Nombre del producto", example = "Cien años de soledad")
    @Size(max = 200, message = "El nombre no puede exceder 200 caracteres")
    String productName,

    @Schema(description = "Cantidad disponible en stock", example = "50", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    Integer cantidad,

    @Schema(description = "Stock mínimo para alertas", example = "5")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    Integer minStock,

    @Schema(description = "Stock máximo (capacidad)", example = "100")
    @Min(value = 1, message = "El stock máximo debe ser al menos 1")
    Integer maxStock,

    @Schema(description = "Ubicación física en almacén", example = "Estante A12")
    @Size(max = 100, message = "La ubicación no puede exceder 100 caracteres")
    String ubicacion
) {}