-- Tabla para rastrear claves de idempotencia procesadas en el carrito
CREATE TABLE idempotency_processed_keys (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(36) NOT NULL,
    usuario_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_idempotency_key ON idempotency_processed_keys(idempotency_key);

-- Restricción única a nivel DB para evitar duplicados de producto en el carrito
CREATE UNIQUE INDEX idx_carrito_producto_unique ON carrito_items_tb(carrito_id, producto_id);
