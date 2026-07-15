-- Active: 1777693241261@@127.0.0.1@5432@product_db
-- ======================================================
-- AUTHOR MICROSERVICE (mismo microservicio de producto)
-- ======================================================
CREATE TABLE authors_tb (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    anio_nacimiento INTEGER,
    anio_defuncion INTEGER,
    pais_origen VARCHAR(100),
    sexo VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    CONSTRAINT chk_author_birth_year CHECK (anio_nacimiento BETWEEN 1000 AND EXTRACT(YEAR FROM CURRENT_DATE)),
    CONSTRAINT chk_author_death_year CHECK (anio_defuncion IS NULL OR anio_defuncion >= anio_nacimiento)
);

CREATE INDEX idx_authors_nombre ON authors_tb(nombre);
CREATE INDEX idx_authors_pais ON authors_tb(pais_origen);
CREATE INDEX idx_authors_sexo ON authors_tb(sexo);

-- ======================================================
-- PRODUCT MICROSERVICE
-- ======================================================
CREATE TABLE products_tb (
    id BIGSERIAL PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12,2) NOT NULL,
    paginas INTEGER,
    anio_publicacion INTEGER,
    image_url VARCHAR(512),
    categoria VARCHAR(50),
    tipo VARCHAR(20) NOT NULL,
    author_id BIGINT,
    inventario_id BIGINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    CONSTRAINT fk_product_author FOREIGN KEY (author_id) REFERENCES authors_tb(id) ON DELETE SET NULL,
    CONSTRAINT chk_product_precio CHECK (precio >= 0),
    CONSTRAINT chk_product_paginas CHECK (paginas > 0),
    CONSTRAINT chk_product_anio CHECK (anio_publicacion BETWEEN 1450 AND EXTRACT(YEAR FROM CURRENT_DATE)),
    CONSTRAINT chk_product_tipo CHECK (tipo IN ('FISICO', 'DIGITAL', 'AUDIO_LIBRO')),
    CONSTRAINT chk_product_categoria CHECK (categoria IN ('NOVELA', 'CIENCIA_FICCION', 'FICCION', 'HISTORIA', 'BIOGRAFIA', 'POESIA', 'INFANTIL', 'TECNICO', 'ENSAYO', 'MISTERIO', 'DRAMA', 'FANTASIA', 'ROMANCE', 'COMEDIA'))
);

CREATE INDEX idx_products_isbn ON products_tb(isbn);
CREATE INDEX idx_products_categoria ON products_tb(categoria);
CREATE INDEX idx_products_author ON products_tb(author_id);
CREATE INDEX idx_products_active ON products_tb(is_active);
CREATE INDEX idx_products_titulo ON products_tb(titulo);
CREATE INDEX idx_products_anio ON products_tb(anio_publicacion);
CREATE INDEX idx_products_inventario ON products_tb(inventario_id);

-- Tabla de tags normalizada
CREATE TABLE product_tags_tb (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products_tb(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    UNIQUE(product_id, tag)
);
CREATE INDEX idx_product_tags_product ON product_tags_tb(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags_tb(tag);

-- Función y triggers para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products_tb
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_authors_updated_at
    BEFORE UPDATE ON authors_tb
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();