-- Agregar columna product_name para mostrar nombre del producto en inventario
ALTER TABLE inventory_tb ADD COLUMN product_name VARCHAR(200);

-- Actualizar registros existentes con nombres de productos
UPDATE inventory_tb SET product_name = 'Cien años de soledad' WHERE producto_id = 1;
UPDATE inventory_tb SET product_name = 'El amor en los tiempos del cólera' WHERE producto_id = 2;
UPDATE inventory_tb SET product_name = 'La casa de los espíritus' WHERE producto_id = 3;
UPDATE inventory_tb SET product_name = 'La ciudad y los perros' WHERE producto_id = 4;
UPDATE inventory_tb SET product_name = 'Aleph' WHERE producto_id = 5;
UPDATE inventory_tb SET product_name = 'Rayuela' WHERE producto_id = 6;
UPDATE inventory_tb SET product_name = 'Como agua para chocolate' WHERE producto_id = 7;
UPDATE inventory_tb SET product_name = 'La sombra del viento' WHERE producto_id = 8;
UPDATE inventory_tb SET product_name = 'Crónica de una muerte anunciada' WHERE producto_id = 9;
UPDATE inventory_tb SET product_name = 'Eva Luna' WHERE producto_id = 10;
UPDATE inventory_tb SET product_name = 'La tía Julia y el escribidor' WHERE producto_id = 11;
UPDATE inventory_tb SET product_name = 'Ficciones' WHERE producto_id = 12;
UPDATE inventory_tb SET product_name = 'Bestiario' WHERE producto_id = 13;
UPDATE inventory_tb SET product_name = 'El juego del ángel' WHERE producto_id = 14;
UPDATE inventory_tb SET product_name = 'Conversación en La Catedral' WHERE producto_id = 15;
UPDATE inventory_tb SET product_name = 'Fundación' WHERE producto_id = 18;
UPDATE inventory_tb SET product_name = 'Desolación' WHERE producto_id = 19;
UPDATE inventory_tb SET product_name = 'La historia del arte' WHERE producto_id = 22;
UPDATE inventory_tb SET product_name = 'El diario de Ana Frank' WHERE producto_id = 23;
