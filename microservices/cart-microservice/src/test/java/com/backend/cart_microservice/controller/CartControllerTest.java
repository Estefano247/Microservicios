package com.backend.cart_microservice.controller;

import com.backend.cart_microservice.dto.AddToCartRequest;
import com.backend.cart_microservice.dto.CartItemResponse;
import com.backend.cart_microservice.dto.CartResponse;
import com.backend.cart_microservice.service.CartService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @Test
    void getCart_returnsCartResponse() throws Exception {
        CartResponse response = new CartResponse(1L, 1L, List.of(), BigDecimal.ZERO);
        when(cartService.getCartByUsuario(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/cart/usuario/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(1));
    }

    @Test
    void addItem_returnsCreatedCart() throws Exception {
        AddToCartRequest request = new AddToCartRequest(100L, 2, null);
        CartResponse response = new CartResponse(1L, 1L,
                List.of(new CartItemResponse(100L, "Book", 2, new BigDecimal("15.00"), new BigDecimal("30.00"))),
                new BigDecimal("30.00"));

        when(cartService.addProductToCart(eq(1L), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/cart/usuario/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productoId").value(100))
                .andExpect(jsonPath("$.items[0].cantidad").value(2));
    }

    @Test
    void addItem_withInvalidRequest_returnsBadRequest() throws Exception {
        AddToCartRequest request = new AddToCartRequest(null, -1, null);

        mockMvc.perform(post("/api/v1/cart/usuario/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void clearCart_returnsNoContent() throws Exception {
        doNothing().when(cartService).clearCart(1L);

        mockMvc.perform(delete("/api/v1/cart/usuario/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void removeItem_returnsUpdatedCart() throws Exception {
        CartResponse response = new CartResponse(1L, 1L, List.of(), BigDecimal.ZERO);
        when(cartService.removeItem(1L, 100L)).thenReturn(response);

        mockMvc.perform(delete("/api/v1/cart/usuario/1/items/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(1));
    }
}
