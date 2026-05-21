INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (101, 50, 5, 100, '2026-01-15 10:30:00', 'Almacen A-01', 1);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (102, 30, 5, 80, '2026-01-16 11:00:00', 'Almacen A-02', 2);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (103, 12, 10, 50, '2026-02-01 09:15:00', 'Almacen B-05', 3);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (104, 8, 5, 40, '2026-02-10 14:20:00', 'Almacen C-12', 4);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (105, 100, 20, 200, '2026-02-15 08:00:00', 'Almacen A-10', 5);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (106, 25, 5, 60, '2026-01-20 16:45:00', 'Almacen B-01', 6);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (107, 3, 5, 30, '2026-02-20 12:00:00', 'Almacen C-03', 7);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (108, 45, 10, 100, '2026-02-22 10:30:00', 'Almacen A-05', 8);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (109, 60, 15, 120, '2026-01-05 15:00:00', 'Almacen B-09', 9);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (110, 15, 5, 50, '2026-02-24 09:00:00', 'Almacen C-01', 10);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (111, 22, 5, 60, '2026-02-25 11:30:00', 'Almacen A-12', 11);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (112, 10, 5, 40, '2026-02-25 14:00:00', 'Almacen B-15', 12);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (113, 35, 10, 80, '2026-02-25 16:20:00', 'Almacen C-05', 13);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (114, 5, 5, 30, '2026-02-26 08:45:00', 'Almacen A-08', 14);
INSERT INTO inventory_tb (id, cantidad, min_stock, max_stock, fecha_ultima_entrada, ubicacion, producto_id) VALUES (115, 75, 20, 150, '2026-02-26 10:00:00', 'Almacen B-20', 15);

-- Sincronizar secuencia después de inserts con IDs explícitos
SELECT setval('inventory_tb_id_seq', (SELECT MAX(id) FROM inventory_tb));
