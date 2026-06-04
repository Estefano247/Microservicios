package com.backend.product_microservice.repository;
import com.backend.product_microservice.entity.Category;
import com.backend.product_microservice.entity.Product;
import com.backend.product_microservice.entity.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByIsbn(String isbn);
    Page<Product> findByCategoria(Category categoria, Pageable pageable);
    Page<Product> findByTipo(ProductType tipo, Pageable pageable);
    Page<Product> findByAuthorId(Long authorId, Pageable pageable);
    Page<Product> findByCategoriaAndTipoAndAuthorId(Category categoria, ProductType tipo, Long authorId, Pageable pageable);
    Page<Product> findByTituloContainingIgnoreCase(String titulo, Pageable pageable);
    Page<Product> findByCategoriaAndTituloContainingIgnoreCase(Category categoria, String titulo, Pageable pageable);
}