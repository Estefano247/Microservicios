-- ======================================================
-- V2: Cambiar ip_address de INET a VARCHAR(45)
-- La entidad JPA UserSession define ip_address como String
-- con longitud 45, pero V1 la creo como INET.
-- ======================================================

ALTER TABLE user_sessions_tb ALTER COLUMN ip_address TYPE VARCHAR(45);
