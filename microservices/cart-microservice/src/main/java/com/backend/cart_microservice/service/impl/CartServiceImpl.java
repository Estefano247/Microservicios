package com.backend.cart_microservice.service.impl;


import com.backend.cart_microservice.client.InventoryClient;
import com.backend.cart_microservice.client.InventoryResponse;
import com.backend.cart_microservice.client.ProductClient;
import com.backend.cart_microservice.client.ProductResponse;
import com.backend.cart_microservice.dto.AddToCartRequest;
import com.backend.cart_microservice.dto.CartItemResponse;
import com.backend.cart_microservice.dto.CartResponse;
import com.backend.cart_microservice.entity.Cart;
import com.backend.cart_microservice.entity.IdempotencyRecord;
import com.backend.cart_microservice.repository.CartRepository;
import com.backend.cart_microservice.repository.IdempotencyRecordRepository;
import com.backend.cart_microservice.service.CartService;
import com.backend.cart_microservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final IdempotencyRecordRepository idempotencyRecordRepository;

    @Override
    @Transactional
    public CartResponse addProductToCart(Long usuarioId, AddToCartRequest request) {
        // 1. Idempotency: si ya se procesó esta clave, devolver carrito actual sin efectos secundarios
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<IdempotencyRecord> existing = idempotencyRecordRepository.findByIdempotencyKey(request.idempotencyKey());
            if (existing.isPresent()) {
                log.info("Idempotency key {} ya procesada para el carrito del usuario {}", request.idempotencyKey(), usuarioId);
                return mapToResponse(getOrCreateCart(usuarioId));
            }
        }

        // 2. Validar producto vía Feign
        ProductResponse producto = productClient.getProductById(request.productoId());

        // 3. Buscar o crear carrito
        Cart carrito = getOrCreateCart(usuarioId);

        // 4. Verificar stock si el producto tiene inventario
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

        // 5. Lógica de items
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

        try {
            carrito = cartRepository.save(carrito);
        } catch (DataIntegrityViolationException e) {
            // Safety net: unique constraint (carrito_id, producto_id) – recargar e incrementar existente
            log.warn("Violación de unique constraint para carrito {} producto {}: {}", carrito.getId(), request.productoId(), e.getMessage());
            carrito = cartRepository.findByUsuarioId(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Error de consistencia al recargar carrito"));
            Optional<Cart.CartItem> existente = carrito.getItems().stream()
                    .filter(item -> item.getProductoId().equals(request.productoId()))
                    .findFirst();
            if (existente.isPresent()) {
                existente.get().setCantidad(existente.get().getCantidad() + request.cantidad());
            }
            carrito.setActualizadoEn(Instant.now());
            carrito = cartRepository.save(carrito);
        }

        // 6. Descontar stock del inventario (si aplica)
        if (producto.inventarioId() != null) {
            inventoryClient.reduceStock(producto.inventarioId(), request.cantidad());
        }

        // 7. Persistir idempotency key si se proporcionó
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            IdempotencyRecord record = IdempotencyRecord.builder()
                    .idempotencyKey(request.idempotencyKey())
                    .usuarioId(usuarioId)
                    .productoId(request.productoId())
                    .build();
            try {
                idempotencyRecordRepository.save(record);
            } catch (DataIntegrityViolationException e) {
                log.info("Idempotency key {} ya registrada por otra transacción concurrente", request.idempotencyKey());
            }
        }

        return mapToResponse(carrito);
    }

    private Cart getOrCreateCart(Long usuarioId) {
        return cartRepository.findByUsuarioId(usuarioId)
                .orElse(Cart.builder()
                        .usuarioId(usuarioId)
                        .items(new ArrayList<>())
                        .build());
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