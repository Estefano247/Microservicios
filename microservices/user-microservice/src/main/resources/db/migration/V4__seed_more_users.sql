-- ======================================================
-- SEED: Más usuarios de prueba con roles variados
-- ======================================================
-- Staff: staff@test.com / Staff123$
-- Vendedor: seller@test.com / Staff123$
-- Cliente Premium: premium@test.com / TestUser123$
-- Almacenero: warehouse@test.com / Ware123$
-- ======================================================

INSERT INTO users_tb (name, last_name, email, password, phone, enabled, birthday, role, email_verified, created_at)
VALUES
('Staff', 'Soporte', 'staff@test.com',
 '$2b$10$wDMtaeJ0vY0spPMwcyc74.ziEKDtMPPEGKRhnJlaoIaC6QfOSf37i',
 '+51999000003', true, '1990-01-10', 'SELLER', true, CURRENT_TIMESTAMP),

('Vendedor', 'Ventas', 'seller@test.com',
 '$2b$10$wDMtaeJ0vY0spPMwcyc74.ziEKDtMPPEGKRhnJlaoIaC6QfOSf37i',
 '+51999000004', true, '1988-06-15', 'SELLER', true, CURRENT_TIMESTAMP),

('Premium', 'Cliente VIP', 'premium@test.com',
 '$2b$10$fvW/iHRQzNQ1lazdD6JiSOV3km.a6G2kWsr/RMdZwkNvMcz9Id5c.',
 '+51999000005', true, '1992-11-20', 'CUSTOMER', true, CURRENT_TIMESTAMP),

('Almacenero', 'Logística', 'warehouse@test.com',
 '$2b$10$De4uIraXUDaIE6rJaP8QA.R6fF8XXMdX5DXyeeI1EwlO0cGuIp4TK',
 '+51999000006', true, '1985-03-08', 'CUSTOMER', true, CURRENT_TIMESTAMP);
