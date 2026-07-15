-- ======================================================
-- USER_MICROSERVICE - TABLAS PARA user_db
-- Basado en entidades JPA: User, PasswordHistory, UserSession
--
-- NOTA: Esta migracion es especifica para PostgreSQL.
-- El operador '~' en chk_user_phone_format y el tipo INET
-- para ip_address son extensiones de PostgreSQL.
-- Para migrar a otra BD, se debe adaptar esta migracion.
-- ======================================================

-- 1. Tabla de usuarios (soft delete con columna enabled)
CREATE TABLE users_tb (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    birthday DATE,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMPTZ,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    lock_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT uk_user_email UNIQUE (email),
    CONSTRAINT uk_user_phone UNIQUE (phone),
    CONSTRAINT chk_user_role CHECK (role IN ('CUSTOMER', 'ADMIN', 'SELLER')),
    CONSTRAINT chk_user_failed_attempts CHECK (failed_attempts >= 0 AND failed_attempts <= 10),
    CONSTRAINT chk_user_phone_format CHECK (phone ~ '^\+?[0-9]{7,15}$')
);

-- 2. Historial de contraseñas
CREATE TABLE password_history_tb (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES users_tb(id) ON DELETE CASCADE
);

-- 3. Sesiones activas de usuario
CREATE TABLE user_sessions_tb (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users_tb(id) ON DELETE CASCADE,
    CONSTRAINT uk_session_token_hash UNIQUE (token_hash)
);

-- ======================================================
-- ÍNDICES (coinciden con @Index de las entidades)
-- ======================================================

-- Índices para users_tb
CREATE INDEX idx_user_email ON users_tb(email);
CREATE INDEX idx_user_phone ON users_tb(phone);
CREATE INDEX idx_user_enabled ON users_tb(enabled);
CREATE INDEX idx_user_role ON users_tb(role);
CREATE INDEX idx_user_last_login ON users_tb(last_login);

-- Índices para password_history_tb
CREATE INDEX idx_password_history_user ON password_history_tb(user_id);
CREATE INDEX idx_password_history_created ON password_history_tb(created_at);

-- Índices para user_sessions_tb
CREATE INDEX idx_user_sessions_user ON user_sessions_tb(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions_tb(expires_at);