package com.backend.order_microservice.repository;

import com.backend.order_microservice.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId, Pageable pageable);

    Optional<Order> findByNumeroOrden(String numeroOrden);
}
