-- ======================================================
-- SEED: Usuarios de prueba
-- ======================================================
-- Admin: admin@test.com / Admin123$
-- Customer: customer@test.com / Customer123$
-- ======================================================

INSERT INTO users_tb (name, last_name, email, password, phone, enabled, birthday, role, email_verified, created_at)
VALUES
('Admin', 'Principal', 'admin@test.com',
 '$2b$10$yqW5nxqmjeMwh5558iuu/uawuV2qI5QXcv7Q3J3jKWftJY8/yNS4.',
 '+51999000001', true, '1985-03-15', 'ADMIN', true, CURRENT_TIMESTAMP),

('Cliente', 'Prueba', 'customer@test.com',
 '$2b$10$yqW5nxqmjeMwh5558iuu/uW8vEYWyuhK7n7QlIUuile3XeGCQj7wS',
 '+51999000002', true, '1995-07-22', 'CUSTOMER', true, CURRENT_TIMESTAMP);
