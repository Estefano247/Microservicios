package com.backend.order_microservice.service;

import com.backend.order_microservice.dto.request.CreateOrderRequest;
import com.backend.order_microservice.dto.request.UpdateOrderStatusRequest;
import com.backend.order_microservice.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(Long id);

    OrderResponse getOrderByNumeroOrden(String numeroOrden);

    Page<OrderResponse> getOrdersByUsuarioId(Long usuarioId, Pageable pageable);

    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    void cancelOrder(Long id);
}
