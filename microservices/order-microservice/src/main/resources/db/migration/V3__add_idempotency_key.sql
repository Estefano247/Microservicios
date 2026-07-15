ALTER TABLE order_tb ADD COLUMN idempotency_key VARCHAR(36);
ALTER TABLE order_tb ADD CONSTRAINT uk_order_idempotency_key UNIQUE (idempotency_key);
CREATE INDEX idx_order_idempotency_key ON order_tb(idempotency_key);
