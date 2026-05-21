package com.backend.cart_microservice.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.cart_microservice.entity.Cart;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Buscamos el carrito por el ID del usuario
    Optional<Cart> findByUsuarioId(Long usuarioId);
    
    // Para verificar si un usuario ya tiene carrito antes de crear uno
    boolean existsByUsuarioId(Long usuarioId);
    
    // Método para vaciar el carrito tras una compra (se usa desde el Micro de Órdenes)
    void deleteByUsuarioId(Long usuarioId);
}