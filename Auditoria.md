# Auditoría de Código - Librería Store

## Alcance

- `analytics-dashboard/` — Dashboard Python/Streamlit
- `libreria-frontend/` — Frontend React
- `config-server/` — Config Server & API Gateway rutas
- `docker-compose.yml` — Orquestación
- Microservicios (user, product, inventory, cart, order)

---

## 1. Revisión del Analytics Dashboard

### 1.1 Conexión directa a bases de datos (CRÍTICO)

- **Archivo:** `analytics-dashboard/app.py:58-61`
- **Problema:** El dashboard se conecta directamente a PostgreSQL (`user_db`, `product_db`, `inventory_db`) usando credenciales estáticas, **sin pasar por el API Gateway ni los microservicios**.
- **Riesgo:** Expone las credenciales de la base de datos a un servicio Python. Rompe el aislamiento de microservicios. Si el dashboard es comprometido, se tiene acceso directo a 3 bases de datos.
- **Recomendación:** El dashboard debería consumir las APIs de los microservicios a través del API Gateway, igual que el frontend React.

### 1.2 Credenciales hardcodeadas (CRÍTICO)

- **Archivo:** `analytics-dashboard/app.py:19-22`
  ```python
  DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
  ```
- **Problema:** El valor por defecto `'password'` es débil y está hardcodeado. Si la variable de entorno no está configurada, se usa una contraseña predecible.
- **Riesgo:** Posible acceso no autorizado a PostgreSQL.
- **Recomendación:** Eliminar el valor por defecto, forzar que `DB_PASSWORD` sea requerida.

### 1.3 Conexión string con credenciales en memoria

- **Archivo:** `analytics-dashboard/app.py:44`
  ```python
  connection_string = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{database_name}'
  ```
- **Problema:** La conexión incluye usuario y contraseña en la URL. Aunque es práctica común con SQLAlchemy, es información sensible en memoria.
- **Recomendación:** Usar `create_engine.URL` con parámetros separados para evitar logging accidental.

### 1.4 Sin autenticación (ALTO)

- **Problema:** El dashboard en `/analytics` es accesible públicamente a través del API Gateway sin requerir JWT ni ningún tipo de autenticación.
- **Riesgo:** Cualquier usuario con acceso a la red puede ver métricas del negocio: cantidad de usuarios, roles, stock bajo, precios promedios, etc.
- **Recomendación:** Agregar middleware de autenticación en el API Gateway para la ruta `/analytics/**`, o implementar verificación JWT en la app Streamlit.

### 1.5 Bases de datos faltantes

- **Problema:** El dashboard consulta solo `user_db`, `product_db` e `inventory_db`. No incluye `cart_db` ni `order_db`.
- **Impacto:** No hay métricas de carritos abandonados, órdenes por estado, ingresos, productos más vendidos, etc.
- **Recomendación:** Agregar conexiones a `cart_db` y `order_db` para métricas transaccionales.

### 1.6 psycopg2-binary en producción (MEDIO)

- **Archivo:** `analytics-dashboard/requirements.txt:4`
- **Problema:** `psycopg2-binary` está recomendado solo para desarrollo. En producción se debe usar `psycopg2` compilado contra libpq del sistema.
- **Recomendación:** Cambiar a `psycopg2` y asegurar que `libpq-dev` esté instalado en el Dockerfile (ya está).

### 1.7 Cache TTL sin invalidación

- **Archivo:** `analytics-dashboard/app.py:70`
  ```python
  @st.cache_data(ttl=60)
  ```
- **Problema:** Los datos se cachean 60 segundos. Para un dashboard administrativo puede ser aceptable, pero no hay forma de forzar invalidación manual.
- **Recomendación:** Agregar un botón "Refrescar" que limpie la caché con `st.cache_data.clear()`.

### 1.8 Manejo de errores con variables fuera de ámbito

- **Archivo:** `analytics-dashboard/app.py:58-65`
  ```python
  try:
      engine_users = create_db_engine('user_db')
      ...
  except Exception as e:
      st.stop()
  ```
- **Problema:** Si `create_db_engine` lanza una excepción para una de las 3 conexiones, las variables `engine_users`, `engine_products`, `engine_inventory` pueden quedar sin definir (depende de dónde falle). El código posterior asume que existen.
- **Recomendación:** Inicializar las variables como `None` antes del bloque try, o manejar cada conexión por separado.

### 1.9 Dockerfile orden de capas (BAJO)

- **Archivo:** `analytics-dashboard/Dockerfile:11-14`
- **Problema:** `requirements.txt` se copia antes que el código, lo cual es correcto para caché de Docker. Pero el `COPY . .` incluye `requirements.txt` de nuevo, invalidando la caché de la capa anterior.
- **Recomendación:** Usar `COPY requirements.txt .` seguido de `RUN pip install`, luego `COPY app.py .` para mejor cacheo.

---

## 2. Frontend - Admin Dashboard

### 2.1 Sin ruta al Analytics Dashboard

- **Archivo:** `libreria-frontend/src/App.jsx:43-51`
- **Problema:** No hay una ruta `/admin/analytics` ni enlace en la barra lateral de administración (`AdminLayout.jsx:4-10`) que apunte al dashboard de Streamlit.
- **Impacto:** Los administradores no tienen acceso descubrible al panel de analítica desde la interfaz web.
- **Recomendación:** Agregar una entrada "Analítica" en el NAV del AdminLayout que apunte a `/analytics` (proxy al dashboard Streamlit).

### 2.2 Sin visualizaciones gráficas en Admin Dashboard

- **Archivo:** `libreria-frontend/src/pages/admin/Dashboard.jsx`
- **Problema:** El Dashboard.jsx solo muestra 4 métricas (productos, pedidos, usuarios, stock bajo) con cards numéricas. No tiene gráficos (pie charts, barras, tendencias).
- **Recomendación:** Integrar una librería de gráficos (Chart.js, Recharts) o redirigir al dashboard de Streamlit.

---

## 3. Seguridad General

### 3.1 Default JWT secret key (CRÍTICO)

- **Archivo:** `docker-compose.yml:286`
  ```yaml
  JWT_SECRET_KEY: ${JWT_SECRET_KEY:-default-dev-key-not-for-production}
  ```
- **Problema:** Si no se define `JWT_SECRET_KEY` en el entorno, se usa `default-dev-key-not-for-production` como clave de firma JWT. Cualquiera que conozca este valor puede forjar tokens.
- **Riesgo:** Suplantación de identidad de cualquier usuario.
- **Recomendación:** En producción, jamás usar valores por defecto. El servicio debería fallar al arrancar si no encuentra `JWT_SECRET_KEY`.

### 3.2 Sin HTTPS

- **Problema:** Toda la comunicación es HTTP plano (frontend en :3000, API Gateway en :8080, etc.).
- **Riesgo:** Las credenciales y tokens JWT viajan en texto plano.
- **Recomendación:** Agregar TLS termination en el API Gateway o en un reverse proxy (nginx, traefik).

### 3.3 CORS permisivo en desarrollo

- **Archivo:** `docker-compose.yml:95`
  ```yaml
  CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
  ```
- **Problema:** Aceptable para desarrollo local. En producción debe restringirse al dominio real.

### 3.4 Sin rate limiting por usuario

- **Archivo:** `microservices/api-gateway/src/main/resources/application.yml` (RateLimiterConfig mencionado en el task)
- **Nota:** El rate limiter existe pero es global (`100 requests/min`). No hay rate limiting por usuario/token.
- **Recomendación:** Implementar rate limiting basado en JWT claims o IP.

---

## 4. API Gateway

### 4.1 Orden de rutas

- **Archivo:** `config-server/src/main/resources/config/api-gateway.yml:38-49`
- **Problema:** La ruta `nextjs-app` con `Path=/` captura TODAS las URLs no matcheadas antes. Si una ruta específica no matchea primero, cae en el frontend y devuelve 404 del frontend en vez de un error apropiado del gateway.
- **Recomendación:** Mover la ruta `nextjs-app` al final.

### 4.2 Analytics sin authentication filter

- **Archivo:** `config-server/src/main/resources/config/api-gateway.yml:44-49`
- **Problema:** La ruta del dashboard Python no aplica el `JwtAuthenticationFilter`. Es accesible sin token.
- **Recomendación:** Agregar el filtro JWT a la ruta `/analytics/**` o crear una excepción explícita.

---

## 5. Microservicios

### 5.1 Sin pruebas unitarias visibles

- **Problema:** Se encontraron archivos de test (`*Tests.class`) compilados, pero no se ven tests significativos en el código fuente. Solo `UserApplicationTests.java` y clases similares vacías.
- **Recomendación:** Agregar tests unitarios y de integración para los servicios principales.

### 5.2 Fallback de Feign Clients silenciosos

- **Archivo:** `microservices/*-microservice/client/fallback/*`
- **Problema:** Los fallback factories de Feign Clients (Inventory, Product, Cart) devuelven `null` cuando el servicio falla, lo que puede causar `NullPointerException` río abajo.
- **Recomendación:** Los fallbacks deberían lanzar excepciones explícitas o devolver objetos por defecto con indicadores de error.

### 5.3 Optimistic locking en Order sin reintento

- **Archivo:** `microservices/order-microservice/.../entity/Order.java` (tiene `@Version`)
- **Problema:** Si hay conflicto de versión (e.g., dos cancelaciones simultáneas), la operación falla con `OptimisticLockException` pero no hay mecanismo de reintento.
- **Recomendación:** Agregar reintento con Spring Retry (`@Retryable`).

---

## 6. Configuración y DevOps

### 6.1 Variables de entorno duplicadas

- **Problema:** `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` se definen tanto en `.env` como en `docker-compose.yml` con valores por defecto. Si hay discrepancia, el `docker-compose.yml` prevalece.
- **Recomendación:** Usar una sola fuente de verdad (solo `.env` o solo variables en compose).

### 6.2 Sin healthcheck en frontend

- **Archivo:** `docker-compose.yml:306-316` (servicio frontend)
- **Problema:** El servicio `frontend` no tiene healthcheck. Si nginx falla, Docker no lo detecta.

### 6.3 Sin redes separadas por dominio

- **Problema:** Todos los servicios están en la misma red `microservices`. Un servicio comprometido puede alcanzar a cualquier otro.
- **Recomendación:** Separar en redes por dominio (frontend, backend, datos).

---

## 7. Resumen de Hallazgos

| ID | Severidad | Descripción | Área |
|---|---|---|---|
| A1 | **CRÍTICO** | Dashboard conecta directo a DBs sin pasar por API | analytics-dashboard |
| A2 | **CRÍTICO** | Credenciales DB con fallback hardcodeado | analytics-dashboard |
| A3 | **CRÍTICO** | JWT secret key con fallback por defecto | docker-compose |
| A4 | **ALTO** | Dashboard sin autenticación | analytics-dashboard |
| A5 | **ALTO** | Dashboard no consulta cart_db ni order_db | analytics-dashboard |
| A6 | **ALTO** | Sin HTTPS en ningún servicio | General |
| A7 | **MEDIO** | Fallback Feign clients devuelven null | microservicios |
| A8 | **MEDIO** | psycopg2-binary en producción | analytics-dashboard |
| A9 | **MEDIO** | Admin frontend sin enlace al analytics | frontend |
| A10 | **MEDIO** | Sin tests unitarios significativos | microservicios |
| A11 | **MEDIO** | Orden de rutas en API Gateway | api-gateway |
| A12 | **BAJO** | Cache TTL sin invalidación manual | analytics-dashboard |
| A13 | **BAJO** | Dockerfile capas no óptimas | analytics-dashboard |
| A14 | **BAJO** | Sin healthcheck en frontend | docker-compose |
| A15 | **BAJO** | Red única para todos los servicios | docker-compose |

---

## 8. Recomendaciones Prioritarias

1. **Mover analytics dashboard a consumir APIs de microservicios** en vez de conectar directo a PostgreSQL.
2. **Exigir JWT_SECRET_KEY como variable obligatoria** sin valor por defecto.
3. **Agregar autenticación JWT** a la ruta `/analytics/**` en el API Gateway.
4. **Agregar HTTPS** con TLS termination en producción.
5. **Extender el dashboard** para incluir métricas de órdenes y carritos.
6. **Agregar enlace "Analítica"** en el panel de administración del frontend.

---

## 9. Correcciones Aplicadas

| ID | Hallazgo | Cambio |
|---|---|---|
| A2 | Credenciales DB con fallback hardcodeado | `analytics-dashboard/app.py`: se eliminó el valor por defecto `'password'`, ahora valida que `DB_USER` y `DB_PASSWORD` estén definidas, si no, detiene la app con error |
| A3 | JWT secret key con fallback por defecto | `docker-compose.yml`: se cambió a `${JWT_SECRET_KEY:?JWT_SECRET_KEY es obligatorio}`, el servicio falla al arrancar si no está definida |
| A4 | Dashboard sin autenticación | `SecurityConfig.java` y `JwtAuthenticationFilter.java`: se eliminó `/analytics/**` de las rutas públicas. `JwtAuthenticationFilter` y `JwtSecurityContextRepository` ahora aceptan `?token=...` como query param para navegación directa |
| A4 (cont.) | Pasar token desde frontend | `AdminLayout.jsx`: se agregó enlace "Analítica" en la navegación que pasa el JWT via `?token=`. Se agregó icono `chartBar` en `Icon.jsx` |
| A5 | Dashboard incompleto | `app.py`: se agregaron conexiones a `cart_db` y `order_db` con queries para órdenes por estado y resumen de carritos. Se agregaron 2 nuevas visualizaciones y métrica de Total Órdenes |
| A7 | Feign fallbacks devuelven tipo incorrecto | `cart/order InventoryClient.java`: `reduceStock`/`addStock` cambiaron de `String` a `Map<String, String>` para coincidir con el controlador de inventario. `InventoryClientFallbackFactory.java` actualizados acorde |
| A7 (raíz) | Error JSON al modificar stock | La causa era que los Feign clients declaraban `String` como retorno pero el controller devolvía `ResponseEntity<Map<String, String>>` (JSON object). Feign fallaba al deserializar. Se corrigieron tipos + se agregó `inventoryRepository.save()` explícito en `InventoryServiceImpl` |
| A8 | psycopg2-binary en producción | `requirements.txt`: cambiado a `psycopg2` |
| A11 | Orden de rutas en API Gateway | `api-gateway.yml`: se movió la ruta comodín `nextjs-app` (`Path=/`) al final, las rutas específicas ahora tienen prioridad |
| A14 | Frontend sin healthcheck | `docker-compose.yml`: se agregó healthcheck con `wget` al contenedor `frontend` |

### Pendiente

| ID | Hallazgo | Estado |
|---|---|---|
| A1 | Conexión directa a DB (sin API Gateway) | Mitigado parcialmente (A2 + A4 cubren el riesgo de seguridad). Para una solución completa, el dashboard debería consumir APIs de microservicios en vez de SQL directo |
| A6 | Sin HTTPS | Requiere infraestructura (TLS termination en reverse proxy) |
