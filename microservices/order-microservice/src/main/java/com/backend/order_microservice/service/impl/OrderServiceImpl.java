package com.backend.order_microservice.service.impl;

import com.backend.order_microservice.client.*;
import com.backend.order_microservice.dto.request.CreateOrderRequest;
import com.backend.order_microservice.dto.request.UpdateOrderStatusRequest;
import com.backend.order_microservice.dto.response.OrderItemResponse;
import com.backend.order_microservice.dto.response.OrderResponse;
import com.backend.order_microservice.entity.Order;
import com.backend.order_microservice.exception.InvalidOrderStatusException;
import com.backend.order_microservice.exception.OrderNotFoundException;
import com.backend.order_microservice.repository.OrderRepository;
import com.backend.order_microservice.service.OrderService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    private static final Set<String> VALID_TRANSITIONS = Set.of(
        "PENDIENTE", "PAGO_PENDIENTE", "RESERVADO", "COMPLETADO", "CANCELADO", "FALLIDO"
    );

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String idempotencyKey = request.idempotencyKey();
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var existing = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Idempotency key '{}' ya existe, retornando orden existente {}", idempotencyKey, existing.get().getId());
                return mapToResponse(existing.get());
            }
        }

        CartResponse cart;
        try {
            cart = cartClient.getCartByUsuario(request.usuarioId());
        } catch (FeignException e) {
            throw new RuntimeException("Error al obtener el carrito del usuario: " + request.usuarioId(), e);
        }

        if (cart.items() == null || cart.items().isEmpty()) {
            throw new RuntimeException("El carrito está vacío. No se puede crear una orden.");
        }

        List<Order.OrderItem> orderItems = cart.items().stream().map(cartItem -> {
            BigDecimal precioUnitario = cartItem.precioUnitario();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cartItem.cantidad()));
            return Order.OrderItem.builder()
                    .productoId(cartItem.productoId())
                    .cantidad(cartItem.cantidad())
                    .precioCaptura(precioUnitario)
                    .subtotal(subtotal)
                    .build();
        }).toList();

        BigDecimal total = orderItems.stream()
                .map(Order.OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .numeroOrden(UUID.randomUUID().toString())
                .idempotencyKey(idempotencyKey)
                .usuarioId(request.usuarioId())
                .items(orderItems)
                .total(total)
                .estado(Order.EstadoOrden.PENDIENTE)
                .build();

        try {
            order = orderRepository.save(order);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            var existing = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Idempotency key '{}' duplicada en concurrencia, retornando orden existente {}", idempotencyKey, existing.get().getId());
                return mapToResponse(existing.get());
            }
            throw e;
        }

        // Reducir stock para cada producto
        try {
            for (var cartItem : cart.items()) {
                ProductResponse producto = productClient.getProductById(cartItem.productoId());
                if (producto.inventarioId() != null) {
                    inventoryClient.reduceStock(producto.inventarioId(), cartItem.cantidad());
                }
            }
        } catch (FeignException e) {
            log.error("Error al reducir stock: {}", e.getMessage());
            throw new RuntimeException("No se pudo reducir el stock. Cancelando creación de orden.", e);
        }

        try {
            cartClient.clearCart(request.usuarioId());
        } catch (FeignException e) {
            log.error("Error al limpiar carrito del usuario {}: {}", request.usuarioId(), e.getMessage());
        }

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return mapToResponse(findOrderOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumeroOrden(String numeroOrden) {
        return orderRepository.findByNumeroOrden(numeroOrden)
                .map(this::mapToResponse)
                .orElseThrow(() -> new OrderNotFoundException("Orden con número " + numeroOrden + " no encontrada"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUsuarioId(Long usuarioId, Pageable pageable) {
        Map<Long, String> cache = new HashMap<>();
        return orderRepository.findByUsuarioIdOrderByCreadoEnDesc(usuarioId, pageable)
                .map(order -> mapToResponseWithCache(order, cache));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Map<Long, String> cache = new HashMap<>();
        return orderRepository.findAll(pageable).map(order -> mapToResponseWithCache(order, cache));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = findOrderOrThrow(id);
        String nuevoEstado = request.estado().toUpperCase();

        if (!VALID_TRANSITIONS.contains(nuevoEstado)) {
            throw new InvalidOrderStatusException("Estado inválido: " + request.estado()
                    + ". Valores permitidos: " + VALID_TRANSITIONS);
        }

        order.setEstado(Order.EstadoOrden.valueOf(nuevoEstado));
        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findByIdWithLock(id)
                .orElseThrow(() -> new OrderNotFoundException("Orden con ID " + id + " no encontrada"));

        if (order.getEstado() == Order.EstadoOrden.COMPLETADO
                || order.getEstado() == Order.EstadoOrden.CANCELADO) {
            throw new InvalidOrderStatusException("No se puede cancelar una orden en estado: " + order.getEstado());
        }

        // Restaurar stock
        order.getItems().forEach(item -> {
            try {
                ProductResponse producto = productClient.getProductById(item.getProductoId());
                if (producto.inventarioId() != null) {
                    inventoryClient.addStock(producto.inventarioId(), item.getCantidad());
                }
            } catch (FeignException e) {
                log.error("Error al restaurar stock para producto {}: {}", item.getProductoId(), e.getMessage());
            }
        });

        order.setEstado(Order.EstadoOrden.CANCELADO);
        orderRepository.save(order);
    }

    private Order findOrderOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Orden con ID " + id + " no encontrada"));
    }

    private OrderResponse mapToResponse(Order order) {
        return mapToResponseWithCache(order, new HashMap<>());
    }

    private OrderResponse mapToResponseWithCache(Order order, Map<Long, String> tituloCache) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> {
                    String titulo = tituloCache.computeIfAbsent(item.getProductoId(), id -> {
                        try {
                            return productClient.getProductById(id).titulo();
                        } catch (FeignException e) {
                            log.warn("No se pudo obtener título para producto {}: {}", id, e.getMessage());
                            return "";
                        }
                    });
                    return new OrderItemResponse(
                            item.getProductoId(),
                            titulo,
                            item.getCantidad(),
                            item.getPrecioCaptura(),
                            item.getSubtotal()
                    );
                }).toList();

        return new OrderResponse(
                order.getId(),
                order.getNumeroOrden(),
                order.getUsuarioId(),
                itemResponses,
                order.getTotal(),
                order.getEstado().name(),
                order.getCreadoEn(),
                order.getIdempotencyKey()
        );
    }
}
