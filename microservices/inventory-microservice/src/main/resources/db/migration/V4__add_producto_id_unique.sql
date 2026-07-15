-- Restricción única para evitar duplicados de inventario por producto
ALTER TABLE inventory_tb ADD CONSTRAINT uk_inventory_producto_id UNIQUE (producto_id);
