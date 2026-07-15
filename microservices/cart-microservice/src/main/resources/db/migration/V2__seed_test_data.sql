-- Seed: Carrito de prueba para el customer (usuario_id = 2)
-- Productos: 2x Cien años de soledad, 1x La sombra del viento
INSERT INTO cart_tb (id, usuario_id, actualizado_en) VALUES (1, 2, CURRENT_TIMESTAMP);

INSERT INTO carrito_items_tb (carrito_id, producto_id, cantidad, precio_referencia, metadatos)
VALUES (1, 1, 2, 25.50, 'Cien años de soledad');

INSERT INTO carrito_items_tb (carrito_id, producto_id, cantidad, precio_referencia, metadatos)
VALUES (1, 8, 1, 21.00, 'La sombra del viento');

SELECT setval('cart_tb_id_seq', (SELECT MAX(id) FROM cart_tb));
