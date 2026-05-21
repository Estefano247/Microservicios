package com.backend.product_microservice.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "product_tags_tb")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductTag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false)
    private String tag;
}