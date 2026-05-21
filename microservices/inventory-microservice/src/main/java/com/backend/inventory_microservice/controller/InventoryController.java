package com.backend.inventory_microservice.controller;

import com.backend.inventory_microservice.dto.request.InventoryRequest;
import com.backend.inventory_microservice.dto.response.InventoryResponse;
import com.backend.inventory_microservice.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Inventario", description = "Endpoints para gestión de inventario")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Crear un nuevo registro de inventario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Inventario creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "409", description = "Ya existe inventario para ese producto")
    })
    public ResponseEntity<InventoryResponse> createInventory(@Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.createInventory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener inventario por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inventario encontrado"),
            @ApiResponse(responseCode = "404", description = "Inventario no encontrado")
    })
    public ResponseEntity<InventoryResponse> getInventoryById(
            @Parameter(description = "ID del inventario", example = "5")
            @PathVariable Long id) {
        InventoryResponse response = inventoryService.getInventoryById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Obtener inventario por ID de producto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inventario encontrado"),
            @ApiResponse(responseCode = "404", description = "No hay inventario para ese producto")
    })
    public ResponseEntity<InventoryResponse> getInventoryByProductId(
            @Parameter(description = "ID del producto", example = "10")
            @PathVariable Long productId) {
        InventoryResponse response = inventoryService.getInventoryByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Listar todos los inventarios")
    public ResponseEntity<List<InventoryResponse>> getAllInventories() {
        List<InventoryResponse> responses = inventoryService.getAllInventories();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un inventario existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inventario actualizado"),
            @ApiResponse(responseCode = "404", description = "Inventario no encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflicto con otro inventario")
    })
    public ResponseEntity<InventoryResponse> updateInventory(
            @Parameter(description = "ID del inventario", example = "5")
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.updateInventory(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro de inventario")
    public ResponseEntity<String> deleteInventory(@PathVariable Long id) {
        String mensaje = inventoryService.deleteInventory(id);
        return ResponseEntity.ok(mensaje);
    }

    @PatchMapping("/{id}/reduce")
    @Operation(summary = "Reducir stock (para pedidos)")
    public ResponseEntity<String> reduceStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        String mensaje = inventoryService.reduceStock(id, quantity);
        return ResponseEntity.ok(mensaje);
    }

    @PatchMapping("/{id}/add")
    @Operation(summary = "Agregar stock (reposición)")
    public ResponseEntity<String> addStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        String mensaje = inventoryService.addStock(id, quantity);
        return ResponseEntity.ok(mensaje);
    }
}