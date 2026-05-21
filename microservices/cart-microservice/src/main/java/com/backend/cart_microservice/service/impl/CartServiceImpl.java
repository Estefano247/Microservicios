package com.backend.cart_microservice.service.impl;


import com.backend.cart_microservice.client.InventoryClient;
import com.backend.cart_microservice.client.InventoryResponse;
import com.backend.cart_microservice.client.ProductClient;
import com.backend.cart_microservice.client.ProductResponse;
import com.backend.cart_microservice.dto.AddToCartRequest;
import com.backend.cart_microservice.dto.CartItemResponse;
import com.backend.cart_microservice.dto.CartResponse;
import com.backend.cart_microservice.entity.Cart;
import com.backend.cart_microservice.repository.CartRepository;
import com.backend.cart_microservice.service.CartService;
import com.backend.cart_microservice.exception.ResourceNotFoundException; // Asegúrate de tener esta clase
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    @Override
    @Transactional
    public CartResponse addProductToCart(Long usuarioId, AddToCartRequest request) {
        // 1. Validar producto vía Feign
        ProductResponse producto = productClient.getProductById(request.productoId());

        // 2. Buscar o crear carrito
        Cart carrito = cartRepository.findByUsuarioId(usuarioId)
                .orElse(Cart.builder()
                        .usuarioId(usuarioId)
                        .items(new ArrayList<>())
                        .build());

        // 3. Verificar stock si el producto tiene inventario
        Optional<Cart.CartItem> itemExistente = carrito.getItems().stream()
                .filter(item -> item.getProductoId().equals(request.productoId()))
                .findFirst();

        int totalQuantity = request.cantidad();
        if (itemExistente.isPresent()) {
            totalQuantity += itemExistente.get().getCantidad();
        }

        if (producto.inventarioId() != null) {
            InventoryResponse inventory = inventoryClient.getInventoryByProductId(producto.id());
            if (inventory.cantidad() < totalQuantity) {
                throw new RuntimeException("Stock insuficiente. Disponible: " + inventory.cantidad() + ", solicitado: " + totalQuantity);
            }
        }

        // 4. Lógica de items
        if (itemExistente.isPresent()) {
            itemExistente.get().setCantidad(itemExistente.get().getCantidad() + request.cantidad());
        } else {
            Cart.CartItem nuevoItem = Cart.CartItem.builder()
                    .productoId(producto.id())
                    .cantidad(request.cantidad())
                    .precioReferencia(producto.precio())
                    .metadatos(producto.titulo())
                    .build();
            carrito.getItems().add(nuevoItem);
        }

        carrito.setActualizadoEn(Instant.now());
        carrito = cartRepository.save(carrito);

        // después de persistir cart, descontamos el stock del inventario (si existe)
        if (producto.inventarioId() != null) {
            inventoryClient.reduceStock(producto.inventarioId(), request.cantidad());
        }

        return mapToResponse(carrito);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long usuarioId, Long productoId) {
        Cart carrito = cartRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el carrito para usuario " + usuarioId));

        Optional<Cart.CartItem> maybe = carrito.getItems().stream()
                .filter(i -> i.getProductoId().equals(productoId))
                .findFirst();
        if (maybe.isEmpty()) {
            throw new ResourceNotFoundException("El producto " + productoId + " no está en el carrito");
        }
        Cart.CartItem item = maybe.get();
        // restablecer stock si aplica
        try {
            ProductResponse producto = productClient.getProductById(item.getProductoId());
            if (producto.inventarioId() != null) {
                inventoryClient.addStock(producto.inventarioId(), item.getCantidad());
            }
        } catch (Exception e) {
            log.warn("Error devolviendo stock para producto {}: {}", item.getProductoId(), e.getMessage());
        }

        carrito.getItems().remove(item);
        carrito.setActualizadoEn(Instant.now());
        cartRepository.save(carrito);
        return mapToResponse(carrito);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartByUsuario(Long usuarioId) {
        // En lugar de lanzar error, si no existe devolvemos un DTO de carrito vacío
        return cartRepository.findByUsuarioId(usuarioId)
                .map(this::mapToResponse)
                .orElseGet(() -> new CartResponse(null, usuarioId, new ArrayList<>(), BigDecimal.ZERO));
    }

    @Override
    @Transactional
    public void clearCart(Long usuarioId) {
        log.info("Vaciando carrito del usuario: {}", usuarioId);
        Cart carrito = cartRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el carrito para eliminar"));

        // Antes de borrar, devolvemos el stock de cada item al inventario
        carrito.getItems().forEach(item -> {
            try {
                ProductResponse producto = productClient.getProductById(item.getProductoId());
                if (producto.inventarioId() != null) {
                    inventoryClient.addStock(producto.inventarioId(), item.getCantidad());
                }
            } catch (Exception e) {
                log.warn("No se pudo devolver stock para producto {}: {}", item.getProductoId(), e.getMessage());
            }
        });

        // eliminar entidad
        cartRepository.delete(carrito);
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> new CartItemResponse(
                        item.getProductoId(),
                        item.getMetadatos(),
                        item.getCantidad(),
                        item.getPrecioReferencia(),
                        item.getPrecioReferencia().multiply(BigDecimal.valueOf(item.getCantidad()))
                )).toList();

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), cart.getUsuarioId(), itemResponses, total);
    }
}