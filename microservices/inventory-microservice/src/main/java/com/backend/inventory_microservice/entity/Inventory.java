package com.backend.inventory_microservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor 
@AllArgsConstructor
@Builder
@Table(name = "inventory_tb")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad;
    private Integer minStock;
    private Integer maxStock;
    private LocalDateTime fechaUltimaEntrada;
    private String ubicacion;

    @Column(name = "producto_id", unique = true)
    private Long productoId;

    @Column(name = "product_name")
    private String productName;
}
