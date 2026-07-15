package com.backend.order_microservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "order_tb")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_orden", nullable = false, unique = true, length = 36)
    private String numeroOrden = UUID.randomUUID().toString();

    @Column(name = "idempotency_key", unique = true, length = 36)
    private String idempotencyKey;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @ElementCollection
    @CollectionTable(name = "orden_items_tb", joinColumns = @JoinColumn(name = "orden_id"))
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "total", precision = 19, scale = 4)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 32)
    private EstadoOrden estado = EstadoOrden.PENDIENTE;

    @Column(name = "creado_en")
    private Instant creadoEn = Instant.now();

    @Version
    @Column(name = "version")
    private Long version;

    public enum EstadoOrden {
        PENDIENTE,
        PAGO_PENDIENTE,
        RESERVADO,
        COMPLETADO,
        CANCELADO,
        FALLIDO
    }

    @Embeddable
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class OrderItem {
        @Column(name = "producto_id", nullable = false)
        private Long productoId;

        @Column(name = "cantidad", nullable = false)
        private Integer cantidad;

        @Column(name = "precio_captura", precision = 19, scale = 4)
        private BigDecimal precioCaptura;

        @Column(name = "subtotal", precision = 19, scale = 4)
        private BigDecimal subtotal;
    }
}