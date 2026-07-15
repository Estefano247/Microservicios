package com.backend.product_microservice.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "products_tb")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String isbn;
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private Integer paginas;
    private Integer anioPublicacion;
    private String imageUrl;
    @Enumerated(EnumType.STRING)
    private Category categoria;
    @Enumerated(EnumType.STRING)
    private ProductType tipo;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;
    private Long inventarioId;
    @Builder.Default
    private Boolean isActive = true;
    @CreationTimestamp @Column(updatable = false)
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
