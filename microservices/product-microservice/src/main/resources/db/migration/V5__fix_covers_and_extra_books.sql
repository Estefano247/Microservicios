-- =========================================================================
-- V5: Corrige portadas rotas de los libros existentes y agrega más títulos.
-- Las portadas usan Open Library (por ISBN). Si una portada no existe,
-- la URL responde 404 y el frontend muestra un placeholder elegante.
-- Los nuevos libros son DIGITAL/AUDIO_LIBRO (inventario_id NULL): siempre
-- disponibles, sin necesidad de registros de inventario.
-- =========================================================================

-- 1) Portadas reales para los productos existentes (1-24)
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780307474728-L.jpg?default=false' WHERE id = 1;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780307387264-L.jpg?default=false' WHERE id = 2;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9781501117015-L.jpg?default=false' WHERE id = 3;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9788420471839-L.jpg?default=false' WHERE id = 4;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780143105183-L.jpg?default=false' WHERE id = 5;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780679776437-L.jpg?default=false' WHERE id = 6;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780385420174-L.jpg?default=false' WHERE id = 7;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780143034902-L.jpg?default=false' WHERE id = 8;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9781400034956-L.jpg?default=false' WHERE id = 9;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9781501117992-L.jpg?default=false' WHERE id = 10;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780312427443-L.jpg?default=false' WHERE id = 11;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780802130303-L.jpg?default=false' WHERE id = 12;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9788466331903-L.jpg?default=false' WHERE id = 13;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780143126393-L.jpg?default=false' WHERE id = 14;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780062390639-L.jpg?default=false' WHERE id = 15;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9781501142970-L.jpg?default=false' WHERE id = 16;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg?default=false' WHERE id = 17;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg?default=false' WHERE id = 18;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9789561117655-L.jpg?default=false' WHERE id = 19;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780553294385-L.jpg?default=false' WHERE id = 20;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780618260300-L.jpg?default=false' WHERE id = 21;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780714832470-L.jpg?default=false' WHERE id = 22;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9780553296983-L.jpg?default=false' WHERE id = 23;
UPDATE products_tb SET image_url = 'https://covers.openlibrary.org/b/isbn/9788437622354-L.jpg?default=false' WHERE id = 24;

-- 2) Autores nuevos
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (15, 'George Orwell', 1903, 1950, 'Reino Unido', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (16, 'Antoine de Saint-Exupéry', 1900, 1944, 'Francia', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (17, 'Miguel de Cervantes', 1547, 1616, 'España', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (18, 'Fiódor Dostoyevski', 1821, 1881, 'Rusia', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (19, 'Paulo Coelho', 1947, NULL, 'Brasil', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (20, 'J.K. Rowling', 1965, NULL, 'Reino Unido', 'Femenino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (21, 'Yuval Noah Harari', 1976, NULL, 'Israel', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (22, 'Dan Brown', 1964, NULL, 'Estados Unidos', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (23, 'Suzanne Collins', 1962, NULL, 'Estados Unidos', 'Femenino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (24, 'Khaled Hosseini', 1965, NULL, 'Afganistán', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (25, 'Ray Bradbury', 1920, 2012, 'Estados Unidos', 'Masculino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (26, 'Harper Lee', 1926, 2016, 'Estados Unidos', 'Femenino');
INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo) VALUES (27, 'Homero', NULL, NULL, 'Grecia', 'Masculino');

-- 3) Nuevos títulos digitales y audiolibros (inventario_id NULL)
INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id) VALUES
 (25, '9780451524935', '1984', 'Una distopía sobre la vigilancia total y el control del pensamiento.', 13.99, 328, 1949, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg?default=false', 'CIENCIA_FICCION', 'DIGITAL', 15, NULL),
 (26, '9780156012195', 'El Principito', 'Un clásico atemporal sobre la amistad y la mirada de la infancia.', 9.50, 96, 1943, 'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg?default=false', 'INFANTIL', 'DIGITAL', 16, NULL),
 (27, '9788420412146', 'Don Quijote de la Mancha', 'Las aventuras del ingenioso hidalgo y su fiel escudero.', 19.90, 1200, 1605, 'https://covers.openlibrary.org/b/isbn/9788420412146-L.jpg?default=false', 'NOVELA', 'DIGITAL', 17, NULL),
 (28, '9780486415871', 'Crimen y castigo', 'La culpa y la redención de un joven estudiante en San Petersburgo.', 12.50, 671, 1866, 'https://covers.openlibrary.org/b/isbn/9780486415871-L.jpg?default=false', 'DRAMA', 'DIGITAL', 18, NULL),
 (29, '9780061122415', 'El Alquimista', 'Un viaje en busca del tesoro y del sentido de la vida.', 11.99, 208, 1988, 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg?default=false', 'FICCION', 'AUDIO_LIBRO', 19, NULL),
 (30, '9788478884459', 'Harry Potter y la piedra filosofal', 'El inicio de la saga del joven mago.', 16.99, 256, 1997, 'https://covers.openlibrary.org/b/isbn/9788478884459-L.jpg?default=false', 'FANTASIA', 'DIGITAL', 20, NULL),
 (31, '9780062316097', 'Sapiens: De animales a dioses', 'Una breve historia de la humanidad.', 21.00, 443, 2011, 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg?default=false', 'HISTORIA', 'DIGITAL', 21, NULL),
 (32, '9780307474278', 'El código Da Vinci', 'Un thriller de símbolos, arte y secretos.', 14.50, 489, 2003, 'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg?default=false', 'MISTERIO', 'AUDIO_LIBRO', 22, NULL),
 (33, '9780439023481', 'Los juegos del hambre', 'Un juego mortal transmitido por televisión.', 13.00, 374, 2008, 'https://covers.openlibrary.org/b/isbn/9780439023481-L.jpg?default=false', 'CIENCIA_FICCION', 'DIGITAL', 23, NULL),
 (34, '9781594631931', 'Cometas en el cielo', 'Amistad y redención en el Afganistán de finales del siglo XX.', 15.50, 371, 2003, 'https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg?default=false', 'DRAMA', 'DIGITAL', 24, NULL),
 (35, '9780140268867', 'La Odisea', 'El regreso de Odiseo a Ítaca tras la guerra de Troya.', 12.00, 541, 1900, 'https://covers.openlibrary.org/b/isbn/9780140268867-L.jpg?default=false', 'POESIA', 'AUDIO_LIBRO', 27, NULL),
 (36, '9781451673319', 'Fahrenheit 451', 'Un futuro donde los libros están prohibidos.', 13.50, 256, 1953, 'https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg?default=false', 'CIENCIA_FICCION', 'DIGITAL', 25, NULL),
 (37, '9780061120084', 'Matar a un ruiseñor', 'Justicia e inocencia en el sur de Estados Unidos.', 14.00, 336, 1960, 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg?default=false', 'NOVELA', 'DIGITAL', 26, NULL);

-- 4) Sincronizar secuencias
SELECT setval('products_tb_id_seq', (SELECT MAX(id) FROM products_tb));
SELECT setval('authors_tb_id_seq', (SELECT MAX(id) FROM authors_tb));
