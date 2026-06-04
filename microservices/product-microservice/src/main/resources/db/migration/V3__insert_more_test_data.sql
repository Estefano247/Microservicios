-- Más autores y productos con variedad de categorías y tipos (DIGITAL, AUDIO_LIBRO)

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (8, 'Stephen King', 1947, NULL, 'Estados Unidos', 'Masculino');

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (9, 'Jane Austen', 1775, 1817, 'Inglaterra', 'Femenino');

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (10, 'Isaac Asimov', 1920, 1992, 'Estados Unidos', 'Masculino');

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (11, 'Gabriela Mistral', 1889, 1957, 'Chile', 'Femenino');

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (12, 'E.H. Gombrich', 1909, 2001, 'Austria', 'Masculino');

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (13, 'Ana Frank', 1929, 1945, 'Alemania', 'Femenino');

INSERT INTO authors_tb (id, nombre, anio_nacimiento, anio_defuncion, pais_origen, sexo)
VALUES (14, 'Juan Ramón Jiménez', 1881, 1958, 'España', 'Masculino');

-- Productos digitales y audiolibros
INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (16, '9781501142970', 'It (Eso) - Digital', 'Un grupo de niños enfrenta a un payaso malvado.', 12.99, NULL, 1986, NULL, 'NOVELA', 'DIGITAL', 8, NULL);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (17, '9780141439518', 'Orgullo y Prejuicio - Audiolibro', 'La clásica historia de amor y malentendidos.', 9.99, NULL, 1813, NULL, 'ROMANCE', 'AUDIO_LIBRO', 9, NULL);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (18, '9780553293357', 'Fundación', 'La caída y renacimiento del Imperio Galáctico.', 18.00, 288, 1951, NULL, 'CIENCIA_FICCION', 'FISICO', 10, 116);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (19, '9789563100367', 'Desolación', 'Poemas que reflejan la vida y la naturaleza.', 11.50, 180, 1924, NULL, 'POESIA', 'FISICO', 11, 117);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (20, '9780553293388', 'Yo, Robot', 'Relatos sobre robótica y ética.', 14.00, 224, 1950, NULL, 'CIENCIA_FICCION', 'DIGITAL', 10, NULL);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (21, '9788445000229', 'El Hobbit - Audiolibro', 'La aventura de Bilbo Bolsón.', 15.99, NULL, 1937, NULL, 'FANTASIA', 'AUDIO_LIBRO', 8, NULL);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (22, '9788423350544', 'La historia del arte', 'Un recorrido por las grandes obras de la humanidad.', 35.00, 600, 2020, NULL, 'TECNICO', 'FISICO', 12, 118);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (23, '9788466320542', 'El diario de Ana Frank', 'El testimonio de una niña durante el Holocausto.', 10.50, 240, 1947, NULL, 'BIOGRAFIA', 'FISICO', 13, 119);

INSERT INTO products_tb (id, isbn, titulo, descripcion, precio, paginas, anio_publicacion, image_url, categoria, tipo, author_id, inventario_id)
VALUES (24, '9788437604573', 'Platero y yo', 'Narración lírica sobre un burro y su dueño.', 8.50, 128, 1914, NULL, 'NOVELA', 'DIGITAL', 14, NULL);

SELECT setval('products_tb_id_seq', (SELECT MAX(id) FROM products_tb));
SELECT setval('authors_tb_id_seq', (SELECT MAX(id) FROM authors_tb));
