package com.backend.product_microservice.repository;
import com.backend.product_microservice.entity.ProductTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {
    List<ProductTag> findByProductId(Long productId);
    void deleteByProductId(Long productId);
}
