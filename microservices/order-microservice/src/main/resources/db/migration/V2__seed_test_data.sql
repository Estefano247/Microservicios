-- Seed: Órdenes de prueba para el customer (usuario_id = 2)
-- Orden completada: 2 libros
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en)
VALUES (1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 72.00, 'COMPLETADO', CURRENT_TIMESTAMP - INTERVAL '7 days');

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (1, 1, 2, 25.50, 51.00);

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (1, 8, 1, 21.00, 21.00);

-- Orden pendiente: 1 libro
INSERT INTO order_tb (id, numero_orden, usuario_id, total, estado, creado_en)
VALUES (2, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 2, 22.00, 'PENDIENTE', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO orden_items_tb (orden_id, producto_id, cantidad, precio_captura, subtotal)
VALUES (2, 2, 1, 22.00, 22.00);

SELECT setval('order_tb_id_seq', (SELECT MAX(id) FROM order_tb));
