package com.backend.cart_microservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart_tb")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Coincide con User.id (Long)
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "carrito_items_tb", joinColumns = @JoinColumn(name = "carrito_id"))
    private List<CartItem> items = new ArrayList<>();

    @Column(name = "actualizado_en")
    private Instant actualizadoEn;

    @Embeddable
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class CartItem {
        // Coincide con Product.id (Long)
        @Column(name = "producto_id", nullable = false)
        private Long productoId;

        @Column(name = "cantidad", nullable = false)
        private Integer cantidad;

        @Column(name = "precio_referencia", precision = 19, scale = 4)
        private BigDecimal precioReferencia;

        @Column(name = "metadatos", length = 2000)
        private String metadatos;
    }
}