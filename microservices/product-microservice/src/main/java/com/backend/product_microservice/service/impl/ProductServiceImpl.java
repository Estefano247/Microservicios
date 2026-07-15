package com.backend.product_microservice.service.impl;
import com.backend.product_microservice.client.InventoryClient;
import com.backend.product_microservice.client.InventoryRequest;
import com.backend.product_microservice.client.InventoryResponse;
import com.backend.product_microservice.dto.request.CreateProductRequest;
import com.backend.product_microservice.dto.request.UpdateProductRequest;
import com.backend.product_microservice.dto.response.ProductResponse;
import com.backend.product_microservice.entity.Author;
import com.backend.product_microservice.entity.Category;
import com.backend.product_microservice.entity.Product;
import com.backend.product_microservice.entity.ProductType;
import com.backend.product_microservice.exception.*;
import com.backend.product_microservice.mapper.ProductMapper;
import com.backend.product_microservice.repository.AuthorRepository;
import com.backend.product_microservice.repository.ProductRepository;
import com.backend.product_microservice.service.ProductService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final AuthorRepository authorRepository;
    private final ProductMapper productMapper;
    private final InventoryClient inventoryClient;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsByIsbn(request.isbn()))
            throw new DuplicateIsbnException(request.isbn());

        Author author = authorRepository.findById(request.authorId())
                .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado id: " + request.authorId()));

        Product product = productMapper.toEntity(request);
        product.setAuthor(author);
        product = productRepository.save(product);

        try {
            InventoryRequest invRequest = new InventoryRequest(product.getId(), product.getTitulo(),
                    request.initialStock(), 5, 100, "Almacén central");
            ResponseEntity<InventoryResponse> invResp = inventoryClient.createInventory(invRequest);
            if (invResp.getStatusCode().is2xxSuccessful() && invResp.getBody() != null) {
                product.setInventarioId(invResp.getBody().id());
                product = productRepository.save(product);
            } else {
                throw new InventoryServiceException("Error al crear inventario: respuesta inválida");
            }
        } catch (FeignException e) {
            log.error("Error Feign al crear inventario", e);
            throw new InventoryServiceException("No se pudo crear el inventario. Operación revertida.");
        }
        return productMapper.toResponse(product);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return productMapper.toResponse(findProductOrThrow(id));
    }

    @Override
    public Page<ProductResponse> getAllProducts(String categoria, String tipo, Long authorId, String titulo, Pageable pageable) {
        Page<Product> page;
        if (categoria != null && titulo != null) {
            page = productRepository.findByCategoriaAndTituloContainingIgnoreCase(
                    Category.valueOf(categoria), titulo, pageable);
        } else if (categoria != null && tipo != null && authorId != null) {
            page = productRepository.findByCategoriaAndTipoAndAuthorId(
                    Category.valueOf(categoria), ProductType.valueOf(tipo), authorId, pageable);
        } else if (categoria != null) {
            page = productRepository.findByCategoria(Category.valueOf(categoria), pageable);
        } else if (tipo != null) {
            page = productRepository.findByTipo(ProductType.valueOf(tipo), pageable);
        } else if (authorId != null) {
            page = productRepository.findByAuthorId(authorId, pageable);
        } else if (titulo != null) {
            page = productRepository.findByTituloContainingIgnoreCase(titulo, pageable);
        } else {
            page = productRepository.findAll(pageable);
        }
        return page.map(productMapper::toResponse);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = findProductOrThrow(id);
        // No permitir cambio de ISBN si ya tiene ventas (proxy: inventarioId != null)
        if (!product.getIsbn().equals(request.isbn()) && product.getInventarioId() != null) {
            throw new BusinessException("No se puede cambiar el ISBN porque el producto ya posee registros de ventas asociados.");
        }
        if (!product.getIsbn().equals(request.isbn()) && productRepository.existsByIsbn(request.isbn())) {
            throw new DuplicateIsbnException(request.isbn());
        }
        if (request.authorId() != null && !request.authorId().equals(product.getAuthor().getId())) {
            Author newAuthor = authorRepository.findById(request.authorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado id: " + request.authorId()));
            product.setAuthor(newAuthor);
        }
        productMapper.updateEntity(product, request);
        product = productRepository.save(product);
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProductOrThrow(id);
        Long inventoryId = product.getInventarioId();
        if (inventoryId != null) {
            try {
                inventoryClient.deleteInventory(inventoryId);
            } catch (FeignException.NotFound e) {
                log.warn("Inventario {} no existe, continuando borrado local", inventoryId);
            } catch (FeignException e) {
                log.error("Error al eliminar inventario", e);
                throw new InventoryServiceException("No se pudo eliminar el inventario asociado.");
            }
        }
        productRepository.delete(product);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado id: " + id));
    }
}