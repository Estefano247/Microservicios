CREATE TABLE cart_tb (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX idx_cart_usuario ON cart_tb(usuario_id);

CREATE TABLE carrito_items_tb (
    carrito_id BIGINT NOT NULL REFERENCES cart_tb(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_referencia NUMERIC(19,4),
    metadatos VARCHAR(2000)
);

CREATE INDEX idx_carrito_items_carrito ON carrito_items_tb(carrito_id);
