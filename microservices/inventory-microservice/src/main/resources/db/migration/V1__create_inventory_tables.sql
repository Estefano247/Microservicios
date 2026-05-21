CREATE TABLE inventory_tb (
    id BIGSERIAL PRIMARY KEY,
    cantidad INTEGER,
    min_stock INTEGER,
    max_stock INTEGER,
    fecha_ultima_entrada TIMESTAMP,
    ubicacion VARCHAR(255),
    producto_id BIGINT
);

CREATE INDEX idx_inventory_producto ON inventory_tb(producto_id);
