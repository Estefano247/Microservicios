-- =========================================================================
-- V6: Corrige niveles de stock que eran demasiado bajos para operación
-- normal de la tienda (productos con cantidad por debajo o al límite del
-- stock mínimo, lo que generaba alertas falsas de inventario crítico).
-- =========================================================================

-- Producto 7 (Como agua para chocolate): 3 unidades (min_stock=5) → 25
UPDATE inventory_tb SET cantidad = 25, fecha_ultima_entrada = CURRENT_TIMESTAMP WHERE id = 107;

-- Producto 14 (El juego del ángel): 5 unidades (min_stock=5) → 15
UPDATE inventory_tb SET cantidad = 15, fecha_ultima_entrada = CURRENT_TIMESTAMP WHERE id = 114;

-- Producto 4 (La ciudad y los perros): 8 unidades (min_stock=5) → 20
UPDATE inventory_tb SET cantidad = 20, fecha_ultima_entrada = CURRENT_TIMESTAMP WHERE id = 104;
