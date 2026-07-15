package com.backend.inventory_microservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Respuesta con información de inventario")
public record InventoryResponse(
    @Schema(description = "ID del registro de inventario", example = "5")
    Long id,

    @Schema(description = "ID del producto asociado", example = "10")
    Long productId,

    @Schema(description = "Nombre del producto", example = "Cien años de soledad")
    String productName,

    @Schema(description = "Cantidad disponible", example = "50")
    Integer cantidad,

    @Schema(description = "Stock mínimo", example = "5")
    Integer minStock,

    @Schema(description = "Stock máximo", example = "100")
    Integer maxStock,

    @Schema(description = "Fecha de última entrada", example = "2025-02-23T10:30:00")
    LocalDateTime fechaUltimaEntrada,

    @Schema(description = "Ubicación en almacén", example = "Estante A12")
    String ubicacion
) {}