# Auditoría de Código - Librería Store

## Lo que falta por corregir

---

### 1. Seguridad General

#### 1.1 Sin HTTPS (ALTO - A6)
- **Problema:** Toda la comunicación es HTTP plano (frontend en :3000, API Gateway en :8080, etc.).
- **Riesgo:** Las credenciales y tokens JWT viajan en texto plano.
- **Recomendación:** Agregar TLS termination en el API Gateway o en un reverse proxy (nginx, traefik).

#### 1.2 CORS permisivo en desarrollo (BAJO)
- **Archivo:** `docker-compose.yml`
- **Problema:** Aceptable para desarrollo local. En producción debe restringirse al dominio real.

#### 1.3 Sin rate limiting por usuario (MEDIO)
- **Archivo:** `microservices/api-gateway/src/main/resources/application.yml`
- **Nota:** El rate limiter existe pero es global (`100 requests/min`). No hay rate limiting por usuario/token.
- **Recomendación:** Implementar rate limiting basado en JWT claims o IP.

---

### 2. API Gateway

#### 2.1 Rutas /api/orders/** sin autenticación JWT (ALTO)
- **Archivo:** `microservices/api-gateway/src/main/resources/application.yml`
- **Problema:** Las rutas `/api/orders/**` no están incluidas en la lista de rutas protegidas con JWT. Cualquier usuario (incluso sin token) puede crear, ver y modificar órdenes.
- **Recomendación:** Agregar `/api/orders/**` a las rutas autenticadas en el gateway.

---

### 3. Microservicios

#### 3.1 GlobalExceptionHandler devuelve 500 para errores de validación (MEDIO)
- **Archivo:** `microservices/product-microservice/.../GlobalExceptionHandler.java`
- **Problema:** Cuando Jakarta Validation falla (e.g., `@PastOrPresent` en un `Integer`), el handler captura `UnexpectedTypeException` y otras excepciones de validación y las devuelve como 500 Internal Server Error. Deberían ser 400 Bad Request con mensajes descriptivos.
- **Recomendación:** Agregar un `@ExceptionHandler(MethodArgumentNotValidException.class)` y `@ExceptionHandler(ConstraintViolationException.class)` que devuelvan 400 con los errores de campo.

#### 3.2 Optimistic locking en Order sin reintento (MEDIO)
- **Archivo:** `microservices/order-microservice/.../entity/Order.java` (tiene `@Version`)
- **Problema:** Si hay conflicto de versión (e.g., dos cancelaciones simultáneas), la operación falla con `OptimisticLockException` pero no hay mecanismo de reintento.
- **Recomendación:** Agregar reintento con Spring Retry (`@Retryable`).

---

### 4. Configuración y DevOps

#### 4.1 Variables de entorno duplicadas (BAJO)
- **Problema:** `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` se definen tanto en `.env` como en `docker-compose.yml` con valores por defecto. Si hay discrepancia, el `docker-compose.yml` prevalece.
- **Recomendación:** Usar una sola fuente de verdad (solo `.env` o solo variables en compose).

#### 4.2 Sin redes separadas por dominio (BAJO - A15)
- **Problema:** Todos los servicios están en la misma red `microservices`. Un servicio comprometido puede alcanzar a cualquier otro.
- **Recomendación:** Separar en redes por dominio (frontend, backend, datos).

---

## Hallazgos Corregidos

| ID | Severidad | Descripción | Área | Solución |
|---|---|---|---|---|
| — | **ALTO** | `@PastOrPresent` usado en `Integer` (`anioPublicacion`) en `CreateProductRequest` causaba 500 al crear producto. Jakarta Validation no soporta esa constraint en tipos numéricos. | product-microservice | Reemplazado por `@Min(1450) @Max(2100)` en `CreateProductRequest.java:13` |
| — | **BAJO** | Dos barras de búsqueda visibles simultáneamente en la vista de resultados: una en el Navbar y otra duplicada en Home.jsx. | frontend | Eliminada la barra duplicada en `Home.jsx:211-218` |

---

## Resumen de Hallazgos Pendientes

| ID | Severidad | Descripción | Área |
|---|---|---|---|
| A6 | **ALTO** | Sin HTTPS en ningún servicio | General |
| — | **ALTO** | Rutas /api/orders/** sin autenticación JWT | api-gateway |
| A15 | **BAJO** | Red única para todos los servicios | docker-compose |
| — | **MEDIO** | GlobalExceptionHandler devuelve 500 en errores de validación | product-microservice |
| — | **MEDIO** | Sin rate limiting por usuario | api-gateway |
| — | **MEDIO** | Optimistic locking sin reintento | order-microservice |
| — | **BAJO** | CORS permisivo en desarrollo | docker-compose |
| — | **BAJO** | Variables de entorno duplicadas | docker-compose |

---

## Resumen de Hallazgos que No Aplican

| ID | Severidad | Descripción | Razón |
|---|---|---|---|
| A12 | **BAJO** | Cache TTL sin invalidación manual | Servicio `analytics-dashboard` eliminado |
| A13 | **BAJO** | Dockerfile capas no óptimas | Servicio `analytics-dashboard` eliminado |
| — | **MEDIO** | Conexión string con credenciales en memoria | Servicio `analytics-dashboard` eliminado |
| — | **BAJO** | Manejo de errores con variables fuera de ámbito | Servicio `analytics-dashboard` eliminado |
| A22 | **CRÍTICO** | updateQuantity no-op para usuarios autenticados | Por diseño: UI oculta controles para usuarios autenticados |
| A25 | **CRÍTICO** | Redirección post-login admin (ROLE_ADMIN vs ADMIN) | El servidor devuelve `role: "ADMIN"` (enum sin prefijo), la comparación funciona correctamente |

---

## Recomendaciones Prioritarias Pendientes

| # | Estado | Acción |
|---|---|---|
| 1 | ⏳ Pendiente | HTTPS con TLS termination (requiere infraestructura/certificados) |
| 2 | ⏳ Pendiente | Proteger rutas /api/orders/** con JWT en API Gateway |
| 3 | ⏳ Pendiente | Rate limiting por usuario/token |
| 4 | ⏳ Pendiente | Optimistic locking con reintento en Order |
| 5 | ⏳ Pendiente | Separar redes Docker por dominio |
| 6 | ⏳ Pendiente | Mejorar GlobalExceptionHandler para devolver 400 en errores de validación |
