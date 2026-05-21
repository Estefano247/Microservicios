package com.backend.cart_microservice.service;

import com.backend.cart_microservice.dto.AddToCartRequest;
import com.backend.cart_microservice.dto.CartResponse;

public interface CartService {
    
    // Añade un producto o actualiza la cantidad si ya existe
    CartResponse addProductToCart(Long usuarioId, AddToCartRequest request);
    
    // Obtiene el carrito actual del usuario
    CartResponse getCartByUsuario(Long usuarioId);
    
    // Vacía el carrito por completo
    void clearCart(Long usuarioId);

    CartResponse removeItem(Long usuarioId, Long productoId);
}