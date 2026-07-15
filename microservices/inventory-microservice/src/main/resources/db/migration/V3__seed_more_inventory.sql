-- Inventario para los nuevos productos físicos (IDs 18, 19, 22, 23)
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id)
VALUES (116, 20, 5, 80, CURRENT_TIMESTAMP, 'Almacen D-01', 18);

INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id)
VALUES (117, 15, 5, 60, CURRENT_TIMESTAMP, 'Almacen D-02', 19);

INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id)
VALUES (118, 10, 3, 40, CURRENT_TIMESTAMP, 'Almacen D-03', 22);

INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id)
VALUES (119, 25, 5, 100, CURRENT_TIMESTAMP, 'Almacen D-04', 23);

SELECT setval('inventory_tb_id_seq', (SELECT MAX(id) FROM inventory_tb));
