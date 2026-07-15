
package com.backend.cart_microservice.controller;

import com.backend.cart_microservice.dto.AddToCartRequest;
import com.backend.cart_microservice.dto.CartResponse;
import com.backend.cart_microservice.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Carrito", description = "Gestión del carrito de compras por usuario")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Obtener carrito de un usuario")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(cartService.getCartByUsuario(usuarioId));
    }

    @Operation(summary = "Añadir o actualizar producto en el carrito")
    @PostMapping("/usuario/{usuarioId}/items")
    public ResponseEntity<CartResponse> addItem(
            @PathVariable Long usuarioId,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addProductToCart(usuarioId, request));
    }

    @Operation(summary = "Vaciar carrito (uso interno o manual)")
    @DeleteMapping("/usuario/{usuarioId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long usuarioId) {
        cartService.clearCart(usuarioId); // Deberás añadir este método al Service
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar un ítem del carrito y devolver stock")
    @DeleteMapping("/usuario/{usuarioId}/items/{productoId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long usuarioId,
            @PathVariable Long productoId) {
        CartResponse updated = cartService.removeItem(usuarioId, productoId);
        return ResponseEntity.ok(updated);
    }
}