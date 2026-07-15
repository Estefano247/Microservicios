-- Restricción única en nombre para evitar autores duplicados
ALTER TABLE authors_tb ADD CONSTRAINT uk_authors_nombre UNIQUE (nombre);

-- Columna para idempotency key en authors_tb
ALTER TABLE authors_tb ADD COLUMN idempotency_key VARCHAR(36);
ALTER TABLE authors_tb ADD CONSTRAINT uk_authors_idempotency_key UNIQUE (idempotency_key);
