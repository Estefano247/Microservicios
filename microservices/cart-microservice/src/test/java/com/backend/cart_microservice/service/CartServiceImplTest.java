package com.backend.cart_microservice.service;

import com.backend.cart_microservice.client.InventoryClient;
import com.backend.cart_microservice.client.InventoryResponse;
import com.backend.cart_microservice.client.ProductClient;
import com.backend.cart_microservice.client.ProductResponse;
import com.backend.cart_microservice.dto.AddToCartRequest;
import com.backend.cart_microservice.dto.CartItemResponse;
import com.backend.cart_microservice.dto.CartResponse;
import com.backend.cart_microservice.entity.Cart;
import com.backend.cart_microservice.entity.IdempotencyRecord;
import com.backend.cart_microservice.repository.CartRepository;
import com.backend.cart_microservice.repository.IdempotencyRecordRepository;
import com.backend.cart_microservice.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductClient productClient;
    @Mock
    private InventoryClient inventoryClient;
    @Mock
    private IdempotencyRecordRepository idempotencyRecordRepository;

    private CartService cartService;

    @Captor
    private ArgumentCaptor<Cart> cartCaptor;

    private static final Long USUARIO_ID = 1L;
    private static final Long PRODUCTO_ID = 100L;
    private static final Long INVENTARIO_ID = 10L;

    @BeforeEach
    void setUp() {
        cartService = new CartServiceImpl(cartRepository, productClient, inventoryClient, idempotencyRecordRepository);
    }

    @Test
    void addProductToCart_createsNewCart_whenNoCartExists() {
        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());
        when(productClient.getProductById(PRODUCTO_ID)).thenReturn(
                new ProductResponse(PRODUCTO_ID, "Test Product", new BigDecimal("29.99"), "img.jpg", INVENTARIO_ID));
        when(inventoryClient.getInventoryByProductId(PRODUCTO_ID)).thenReturn(
                new InventoryResponse(INVENTARIO_ID, PRODUCTO_ID, 100, 5, 200, null, "A1"));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AddToCartRequest request = new AddToCartRequest(PRODUCTO_ID, 2, null);
        CartResponse response = cartService.addProductToCart(USUARIO_ID, request);

        assertNotNull(response);
        assertEquals(USUARIO_ID, response.usuarioId());
        assertEquals(1, response.items().size());
        assertEquals(PRODUCTO_ID, response.items().get(0).productoId());
        assertEquals(2, response.items().get(0).cantidad());

        verify(cartRepository).save(cartCaptor.capture());
        Cart saved = cartCaptor.getValue();
        assertEquals(USUARIO_ID, saved.getUsuarioId());
        assertEquals(1, saved.getItems().size());
        assertEquals(2, saved.getItems().get(0).getCantidad());
    }

    @Test
    void addProductToCart_incrementsQuantity_whenItemAlreadyExists() {
        Cart existingCart = Cart.builder()
                .id(1L)
                .usuarioId(USUARIO_ID)
                .items(new ArrayList<>())
                .build();
        Cart.CartItem existingItem = Cart.CartItem.builder()
                .productoId(PRODUCTO_ID)
                .cantidad(3)
                .precioReferencia(new BigDecimal("29.99"))
                .build();
        existingCart.getItems().add(existingItem);

        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(existingCart));
        when(productClient.getProductById(PRODUCTO_ID)).thenReturn(
                new ProductResponse(PRODUCTO_ID, "Test Product", new BigDecimal("29.99"), "img.jpg", INVENTARIO_ID));
        when(inventoryClient.getInventoryByProductId(PRODUCTO_ID)).thenReturn(
                new InventoryResponse(INVENTARIO_ID, PRODUCTO_ID, 100, 5, 200, null, "A1"));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AddToCartRequest request = new AddToCartRequest(PRODUCTO_ID, 2, null);
        CartResponse response = cartService.addProductToCart(USUARIO_ID, request);

        assertEquals(1, response.items().size());
        assertEquals(5, response.items().get(0).cantidad());
    }

    @Test
    void addProductToCart_throwsException_whenStockInsufficient() {
        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());
        when(productClient.getProductById(PRODUCTO_ID)).thenReturn(
                new ProductResponse(PRODUCTO_ID, "Test Product", new BigDecimal("10.00"), "img.jpg", INVENTARIO_ID));
        when(inventoryClient.getInventoryByProductId(PRODUCTO_ID)).thenReturn(
                new InventoryResponse(INVENTARIO_ID, PRODUCTO_ID, 1, 0, 10, null, "A1"));

        AddToCartRequest request = new AddToCartRequest(PRODUCTO_ID, 5, null);
        assertThrows(RuntimeException.class, () -> cartService.addProductToCart(USUARIO_ID, request));
        verify(cartRepository, never()).save(any());
    }

    @Test
    void addProductToCart_reducesStock_whenProductHasInventory() {
        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());
        when(productClient.getProductById(PRODUCTO_ID)).thenReturn(
                new ProductResponse(PRODUCTO_ID, "Test Product", new BigDecimal("15.00"), "img.jpg", INVENTARIO_ID));
        when(inventoryClient.getInventoryByProductId(PRODUCTO_ID)).thenReturn(
                new InventoryResponse(INVENTARIO_ID, PRODUCTO_ID, 50, 5, 100, null, "B2"));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AddToCartRequest request = new AddToCartRequest(PRODUCTO_ID, 3, null);
        cartService.addProductToCart(USUARIO_ID, request);

        verify(inventoryClient).reduceStock(INVENTARIO_ID, 3);
    }

    @Test
    void addProductToCart_returnsExistingCart_whenIdempotencyKeyAlreadyProcessed() {
        String idempotencyKey = "test-key-123";
        when(idempotencyRecordRepository.findByIdempotencyKey(idempotencyKey))
                .thenReturn(Optional.of(IdempotencyRecord.builder()
                        .idempotencyKey(idempotencyKey)
                        .usuarioId(USUARIO_ID)
                        .productoId(PRODUCTO_ID)
                        .build()));
        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(
                Optional.of(Cart.builder()
                        .id(1L)
                        .usuarioId(USUARIO_ID)
                        .items(new ArrayList<>())
                        .actualizadoEn(Instant.now())
                        .build()));

        AddToCartRequest request = new AddToCartRequest(PRODUCTO_ID, 2, idempotencyKey);
        CartResponse response = cartService.addProductToCart(USUARIO_ID, request);

        assertNotNull(response);
        verify(productClient, never()).getProductById(any());
        verify(inventoryClient, never()).reduceStock(any(), any());
    }

    @Test
    void addProductToCart_withoutInventory_skipsStockCheck() {
        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());
        when(productClient.getProductById(PRODUCTO_ID)).thenReturn(
                new ProductResponse(PRODUCTO_ID, "Digital Book", new BigDecimal("9.99"), "img.jpg", null));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AddToCartRequest request = new AddToCartRequest(PRODUCTO_ID, 1, null);
        CartResponse response = cartService.addProductToCart(USUARIO_ID, request);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        verify(inventoryClient, never()).getInventoryByProductId(any());
        verify(inventoryClient, never()).reduceStock(any(), any());
    }

    @Test
    void getCartByUsuario_returnsEmptyCart_whenNoCartExists() {
        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.empty());

        CartResponse response = cartService.getCartByUsuario(USUARIO_ID);

        assertNotNull(response);
        assertEquals(USUARIO_ID, response.usuarioId());
        assertTrue(response.items().isEmpty());
        assertEquals(BigDecimal.ZERO, response.total());
    }

    @Test
    void removeItem_removesItemAndRestoresStock() {
        Cart cart = Cart.builder()
                .id(1L)
                .usuarioId(USUARIO_ID)
                .items(new ArrayList<>())
                .build();
        Cart.CartItem item = Cart.CartItem.builder()
                .productoId(PRODUCTO_ID)
                .cantidad(2)
                .precioReferencia(new BigDecimal("20.00"))
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(cart));
        when(productClient.getProductById(PRODUCTO_ID)).thenReturn(
                new ProductResponse(PRODUCTO_ID, "Test", new BigDecimal("20.00"), "img.jpg", INVENTARIO_ID));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CartResponse response = cartService.removeItem(USUARIO_ID, PRODUCTO_ID);

        assertTrue(response.items().isEmpty());
        verify(inventoryClient).addStock(INVENTARIO_ID, 2);
    }

    @Test
    void removeItem_throwsException_whenItemNotFound() {
        Cart cart = Cart.builder()
                .id(1L)
                .usuarioId(USUARIO_ID)
                .items(new ArrayList<>())
                .build();

        when(cartRepository.findByUsuarioId(USUARIO_ID)).thenReturn(Optional.of(cart));

        assertThrows(com.backend.cart_microservice.exception.ResourceNotFoundException.class,
                () -> cartService.removeItem(USUARIO_ID, 999L));
    }
}
