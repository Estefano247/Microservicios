-- Seed: Ordenes de prueba adicionales para varios usuarios
-- Usuarios existentes: 1=admin, 2=customer, 3=staff, 4=seller, 5=premium, 6=warehouse

-- ============================================================
-- ORDEN 3: customer (id=2) - COMPLETADO - 3 items (varios libros)
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (3, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 2, 58.40, 'COMPLETADO', CURRENT_TIMESTAMP - INTERVAL '5 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (3, 5, 1, 15.00, 15.00);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (3, 7, 2, 14.50, 29.00);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (3, 12, 1, 14.40, 14.40);

-- ============================================================
-- ORDEN 4: premium (id=5) - COMPLETADO - 2 items
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (4, 'd4e5f6a7-b8c9-0123-defa-234567890123', 5, 43.50, 'COMPLETADO', CURRENT_TIMESTAMP - INTERVAL '3 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (4, 1, 1, 25.50, 25.50);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (4, 18, 1, 18.00, 18.00);

-- ============================================================
-- ORDEN 5: warehouse (id=6) - PENDIENTE - 1 item
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (5, 'e5f6a7b8-c9d0-1234-efab-345678901234', 6, 35.00, 'PENDIENTE', CURRENT_TIMESTAMP - INTERVAL '2 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (5, 22, 1, 35.00, 35.00);

-- ============================================================
-- ORDEN 6: customer (id=2) - PAGO_PENDIENTE - 1 item
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (6, 'f6a7b8c9-d0e1-2345-fabc-456789012345', 2, 21.00, 'PAGO_PENDIENTE', CURRENT_TIMESTAMP - INTERVAL '1 day', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (6, 8, 1, 21.00, 21.00);

-- ============================================================
-- ORDEN 7: premium (id=5) - RESERVADO - 3 items
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (7, 'a7b8c9d0-e1f2-3456-abcd-567890123456', 5, 46.99, 'RESERVADO', CURRENT_TIMESTAMP - INTERVAL '12 hours', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (7, 6, 1, 19.99, 19.99);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (7, 13, 1, 13.00, 13.00);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (7, 14, 1, 14.00, 14.00);

-- ============================================================
-- ORDEN 8: warehouse (id=6) - CANCELADO - 1 item
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (8, 'b8c9d0e1-f2a3-4567-bcde-678901234567', 6, 10.50, 'CANCELADO', CURRENT_TIMESTAMP - INTERVAL '4 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (8, 23, 1, 10.50, 10.50);

-- ============================================================
-- ORDEN 9: premium (id=5) - FALLIDO - 2 items
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (9, 'c9d0e1f2-a3b4-5678-cdef-789012345678', 5, 24.99, 'FALLIDO', CURRENT_TIMESTAMP - INTERVAL '6 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (9, 16, 1, 12.99, 12.99);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (9, 20, 1, 12.00, 12.00);

-- ============================================================
-- ORDEN 10: customer (id=2) - COMPLETADO - 1 item digital
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (10, 'd0e1f2a3-b4c5-6789-defa-890123456789', 2, 8.50, 'COMPLETADO', CURRENT_TIMESTAMP - INTERVAL '10 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (10, 24, 1, 8.50, 8.50);

-- ============================================================
-- ORDEN 11: admin (id=1) - PENDIENTE - 2 items
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (11, 'e1f2a3b4-c5d6-7890-efab-901234567890', 1, 37.00, 'PENDIENTE', CURRENT_TIMESTAMP - INTERVAL '6 hours', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (11, 9, 2, 12.00, 24.00);
INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (11, 23, 1, 13.00, 13.00);

-- ============================================================
-- ORDEN 12: premium (id=5) - COMPLETADO - 1 item audiolibro
-- ============================================================
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en, version)
VALUES (12, 'f2a3b4c5-d6e7-8901-fabc-012345678901', 5, 15.99, 'COMPLETADO', CURRENT_TIMESTAMP - INTERVAL '8 days', 0);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (12, 21, 1, 15.99, 15.99);

SELECT setval('order_tb_id_seq', (SELECT MAX(id) FROM order_tb));
