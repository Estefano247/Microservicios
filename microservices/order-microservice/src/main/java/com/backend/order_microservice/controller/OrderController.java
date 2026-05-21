package com.backend.order_microservice.controller;

import com.backend.order_microservice.dto.request.CreateOrderRequest;
import com.backend.order_microservice.dto.request.UpdateOrderStatusRequest;
import com.backend.order_microservice.dto.response.OrderResponse;
import com.backend.order_microservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Órdenes", description = "Endpoints para gestión de órdenes de compra")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Crear una orden desde el carrito del usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Orden creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Carrito vacío o datos inválidos")
    })
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener orden por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Orden encontrada"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/numero/{numeroOrden}")
    @Operation(summary = "Obtener orden por número de orden (UUID)")
    public ResponseEntity<OrderResponse> getOrderByNumeroOrden(@PathVariable String numeroOrden) {
        return ResponseEntity.ok(orderService.getOrderByNumeroOrden(numeroOrden));
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar órdenes de un usuario con paginación")
    public ResponseEntity<Page<OrderResponse>> getOrdersByUsuario(
            @PathVariable Long usuarioId,
            @PageableDefault(size = 10, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByUsuarioId(usuarioId, pageable));
    }

    @GetMapping
    @Operation(summary = "Listar todas las órdenes (admin)")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @PageableDefault(size = 10, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de una orden")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado"),
            @ApiResponse(responseCode = "400", description = "Estado inválido"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar una orden (restaura stock)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Orden cancelada"),
            @ApiResponse(responseCode = "400", description = "No se puede cancelar la orden en su estado actual"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
