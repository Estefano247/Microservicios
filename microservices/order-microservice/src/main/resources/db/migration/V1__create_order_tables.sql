CREATE TABLE order_tb (
    id BIGSERIAL PRIMARY KEY,
    numero_orden VARCHAR(36) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    total NUMERIC(19,4),
    estado VARCHAR(32) NOT NULL DEFAULT 'PENDIENTE',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_orden_estado CHECK (estado IN ('PENDIENTE', 'PAGO_PENDIENTE', 'RESERVADO', 'COMPLETADO', 'CANCELADO', 'FALLIDO'))
);

CREATE INDEX idx_orden_usuario ON order_tb(usuario_id);
CREATE INDEX idx_orden_estado ON order_tb(estado);
CREATE INDEX idx_orden_numero ON order_tb(numero_orden);

CREATE TABLE orden_items_tb (
    orden_id BIGINT NOT NULL REFERENCES order_tb(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_captura NUMERIC(19,4),
    subtotal NUMERIC(19,4)
);

CREATE INDEX idx_orden_items_orden ON orden_items_tb(orden_id);
