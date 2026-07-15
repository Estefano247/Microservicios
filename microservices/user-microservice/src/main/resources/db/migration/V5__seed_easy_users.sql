-- ======================================================
-- SEED: Usuarios de acceso fácil (para pruebas / demo)
-- ------------------------------------------------------
--   Admin:    admin@admin.com       / admin123
--   Vendedor: vendedor@vendedor.com / vendedor123
--   Cliente:  cliente@cliente.com   / cliente123
-- (contraseñas hasheadas con bcrypt; login por correo)
-- ======================================================

INSERT INTO users_tb (name, last_name, email, password, phone, enabled, birthday, role, email_verified, created_at)
VALUES
('Admin', 'Demo', 'admin@admin.com',
 '$2b$10$dYIvnbBiqZ3aOqlj.h8IvuktQsXDUyx6ZVEIEnj7oem/NFYZFXGOO',
 '+51955000001', true, '1990-01-01', 'ADMIN', true, CURRENT_TIMESTAMP),

('Vendedor', 'Demo', 'vendedor@vendedor.com',
 '$2b$10$Pt01o1unAs/WyjZF72/p/.b8zI84y3oimTWKzlehUSOwywwlg7Bza',
 '+51955000002', true, '1990-01-01', 'SELLER', true, CURRENT_TIMESTAMP),

('Cliente', 'Demo', 'cliente@cliente.com',
 '$2b$10$I3a4Nn39VXvpd/E4kXbKJOUvA4nmrQlnxHp0/7gsUzWp1qtsc5kmu',
 '+51955000003', true, '1990-01-01', 'CUSTOMER', true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
