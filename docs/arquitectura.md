# Análisis de Arquitectura - Microservicios Librería

## 1. Arquitectura del Sistema

**Patrón:** Microservicios con Spring Cloud, orientado a un e-commerce tipo librería/bookstore.

**Stack tecnológico principal:**
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje base (backend) |
| Spring Boot | 3.3.1 | Framework principal (backend) |
| Spring Cloud | 2023.0.2 | Ecosistema microservicios |
| Spring Cloud Config Server | - | Configuración centralizada (puerto 8888) |
| Spring Cloud Netflix Eureka | - | Service Discovery (puerto 8761) |
| Spring Cloud Gateway | - | API Gateway (puerto 8080) |
| Spring Cloud OpenFeign | - | Comunicación entre servicios |
| Spring Security + JWT | - | Autenticación (user-microservice) |
| Spring Retry | 2.0.12 | Resiliencia en product-microservice |
| Spring Data JPA / Hibernate | - | ORM |
| Flyway | - | Migraciones de BD |
| PostgreSQL | 15-alpine | Base de datos |
| Maven | 3.9.12 | Build (backend) |
| React | 19.2.6 | Frontend |
| Vite | 8.0.12 | Build tool (frontend) |
| Tailwind CSS | 4.3.0 | Estilos (frontend) |
| React Router | 6.30.4 | Enrutamiento (frontend) |
| Python + Streamlit | 3.9 | Dashboard analíticas |
| Docker | - | Contenerización |

### Diagrama de Arquitectura

```
                     ┌──────────────────────┐
                     │   Frontend React     │
                     │   (Vite :5173)       │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼──────────┐
                     │   API Gateway       │
                     │  (Spring Cloud GW)  │
                     │     Puerto 8080     │
                     └──────┬─────────┬────┘
                            │         │
            ┌───────────────┼─────────┼──────────────────┐
            │               │         │                   │
   ┌────────▼───┐  ┌───────▼────┐ ┌──▼────────┐  ┌──────▼──────────┐
   │ Config     │  │ Discovery  │ │Microserv. │  │   Analytics     │
   │ Server     │  │ Server     │ │Negocio     │  │   Dashboard     │
   │ :8888      │  │ :8761      │ │(5 svcs)   │  │   :8501         │
   └────────────┘  └────────────┘ └────────────┘  └─────────────────┘
```

### Rutas del API Gateway

| Ruta | Destino | Descripción |
|---|---|---|
| `/api/v1/users/**` | lb://USER-MICROSERVICE | Usuarios y autenticación |
| `/api/v1/products/**` | lb://PRODUCT-MICROSERVICE | Productos y autores |
| `/api/v1/inventory/**` | lb://INVENTORY-MICROSERVICE | Inventario y stock |
| `/api/v1/cart/**` | lb://CART-MICROSERVICE | Carrito de compras |
| `/api/v1/orders/**` | lb://ORDER-MICROSERVICE | Pedidos |
| `/*-docs/**` | lb://cada-servicio | Swagger UI |

### Comunicación entre servicios (OpenFeign)

```
product-microservice ──► inventory-microservice  (consulta stock)
cart-microservice    ──► product-microservice     (obtener producto)
cart-microservice    ──► inventory-microservice   (reducir stock)
order-microservice   ──► cart-microservice        (obtener/vaciar carrito)
order-microservice   ──► product-microservice     (detalle producto)
order-microservice   ──► inventory-microservice   (reducir/restaurar stock)
```

### Estructura de paquetes (DDD en user-microservice)

```
user-microservice/
├── domain/
│   ├── entity/         User, Role, PasswordHistory, UserSession
│   ├── service/        UserService (interface), JwtService, ValidationService
│   └── repository/     UserRepository (interface)
├── application/
│   ├── dto/request/    RegisterRequest, LoginRequest, etc.
│   ├── dto/response/   UserResponse, AuthenticationResponse
│   └── mapper/         UserMapper
└── infrastructure/
    ├── config/         SecurityConfig, JwtAuthenticationFilter, etc.
    ├── controller/     AuthController, UserProfileController, AdminUserController
    ├── exception/      6 custom exceptions + handler
    └── repository/     UserRepositoryImpl + JpaUserRepository
```

---

## 2. Implementación Detallada

### Config Server
- Puerto `8888`, perfil `native` (archivos YAML embebidos en classpath)
- Archivos de configuración centralizada: `api-gateway.yml`, `discovery-server.yml`, `user-microservice.yml`, `product-microservice.yml`, `inventory-microservice.yml`, `cart-microservice.yml`, `order-microservice.yml`

### Service Discovery (Eureka)
- Servidor standalone (`register-with-eureka: false`, `fetch-registry: false`)
- Todos los microservicios se registran con `prefer-ip-address: true`

### API Gateway
- Spring Cloud Gateway con WebFlux (reactivo)
- `@EnableWebFluxSecurity` + `anyExchange().permitAll()` — sin autenticación
- Dependencia `spring-boot-starter-oauth2-resource-server` incluida pero sin usar

### User Microservice
- Autenticación JWT completa: register, login, change-password, reset-password
- Roles: `CUSTOMER`, `ADMIN`, `SELLER`
- Soft-delete con `@SQLDelete`
- Bloqueo de cuenta por 30 minutos tras 3 intentos fallidos
- **Sin scheduler** para desbloqueo automático de cuentas
- Flyway migration `V1`, DDL: `validate`
- `spring.sql.init.mode: always` (innecesario con Flyway)

### Product Microservice
- CRUD de productos y autores con 13 categorías y 3 tipos (FÍSICO, DIGITAL, AUDIO_LIBRO)
- Tags de productos (tabla separada)
- Feign client para consultar inventario
- Spring Retry para reintentos en fallos de comunicación
- Flyway migrations `V1` (tablas) + `V2` (datos de prueba), DDL: `validate`
- **IDs hardcodeados** en V2 que se acoplan con inventory (`inventario_id = 101..115`)

### Inventory Microservice
- CRUD de inventario con stock mínimo/máximo
- Lock pesimista (`PESSIMISTIC_WRITE`) en operaciones de stock (correcto)
- Flyway migrations `V1` (tablas) + `V2` (datos de prueba), DDL: `validate`
- Datos de prueba migrados de `import.sql` a `V2__insert_test_data.sql`

### Cart Microservice
- Carrito por usuario con items embeddables
- Feign clients para product e inventory
- Flyway migration `V1` (tablas), DDL: `validate`
- Feign HTTP client 5 habilitado para soporte de PATCH (reduceStock/addStock en inventory)
- **Race condition:** `addProductToCart()` sin lock pesimista
- **Potencial NPE:** `precioReferencia` sin null-check

### Order Microservice
- CRUD de órdenes con estado `PENDIENTE → PAGO_PENDIENTE / RESERVADO / COMPLETADO / CANCELADO / FALLIDO`
- Feign clients para product (título), inventory (stock) y cart (obtener/vaciar)
- Flyway migration `V1` (tablas), DDL: `validate`
- Al crear orden: obtiene carrito → persiste orden → reduce stock → vacía carrito
- Al cancelar: restaura stock de cada producto en inventario

### Analytics Dashboard
- Streamlit dashboard en Python 3.9
- Consulta directa a las bases de datos (bypassea las APIs)
- Se registra en Eureka via `py_eureka_client`
- **Nota:** Directorio renombrado de `analitycs-dashboard` a `analytics-dashboard` (07/06/2026)

---

## 3. Configuración Docker

### docker-compose.yml — Servicios

| Servicio | Puerto | Build Context | Healthcheck |
|---|---|---|---|
| postgres | 5432 | - | `pg_isready` |
| config-server | 8888 | `./config-server` | `nc -z localhost 8888` |
| discovery-server | 8761 | `./discovery-server` | `nc -z localhost 8761` |
| user-microservice | 8091 | `./microservices/user-microservice` | `nc -z localhost 8091` |
| product-microservice | 8092 | `./microservices/product-microservice` | `nc -z localhost 8092` |
| inventory-microservice | 8093 | `./microservices/inventory-microservice` | `nc -z localhost 8093` |
| cart-microservice | 8094 | `./microservices/cart-microservice` | `nc -z localhost 8094` |
| analytics-dashboard | 8501 | `./analytics-dashboard` | `curl .../_stcore/health` |
| api-gateway | 8080 | `./microservices/api-gateway` | `nc -z localhost 8080` |
| order-microservice | 8095 | `./microservices/order-microservice` | `nc -z localhost 8095` |

### 🔴 ERROR CRÍTICO: Build Context Mismatch

**Problema:** Todos los Dockerfiles asumen que el contexto de build es la **raíz del proyecto**, pero `docker-compose.yml` especifica el contexto como el directorio de cada servicio.

**Ejemplo (config-server):**
```yaml
# docker-compose.yml
config-server:
  build: ./config-server       # contexto = ./config-server/
```
```dockerfile
# config-server/Dockerfile
COPY pom.xml ./pom.xml         # busca ./config-server/pom.xml → NO EXISTE
COPY config-server/pom.xml .   # busca ./config-server/config-server/pom.xml → NO EXISTE
```

**Solución:** Cambiar a:
```yaml
config-server:
  build:
    context: .
    dockerfile: config-server/Dockerfile
```

### Dockerfiles — Observaciones

| Servicio | Base Image Builder | Runtime Image | Notas |
|---|---|---|---|
| config-server | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build context roto |
| discovery-server | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build context roto |
| user-microservice | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build context roto |
| product-microservice | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build context roto |
| inventory-microservice | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build context roto |
| cart-microservice | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build context roto |
| api-gateway | maven:3.9-eclipse-temurin-21 | eclipse-temurin:21-jre-alpine | Build innecesario de common-exception |
| order-microservice | maven:3.9-eclipse-temurin-21 | alpine/java:21-jdk | **ENTRYPOINT duplicado**, build context roto |
| analytics-dashboard | python:3.9-slim | python:3.9-slim | Sin `.dockerignore` |

---

## 4. Base de Datos y Migraciones

### Esquema general

| Microservicio | Base de Datos | DDL Strategy | Flyway | Datos persistentes |
|---|---|---|---|---|
| user-microservice | `user_db` | `validate` | ✅ Sí (V1) | ✅ Sí |
| product-microservice | `product_db` | `validate` | ✅ Sí (V1 + V2) | ✅ Sí |
| inventory-microservice | `inventory_db` | `validate` | ✅ Sí (V1 + V2) | ✅ Sí |
| cart-microservice | `cart_db` | `validate` | ✅ Sí (V1) | ✅ Sí |
| order-microservice | `order_db` | `validate` | ✅ Sí (V1) | ✅ Sí |

### postgres-init/init.sql
Crea 5 bases de datos al iniciar PostgreSQL:
```sql
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE inventory_db;
CREATE DATABASE cart_db;
CREATE DATABASE order_db;
```

### Migraciones Flyway existentes

| Archivo | Servicio | Contenido |
|---|---|---|
| `V1__create_user_tables.sql` | user | `users_tb`, `password_history_tb`, `user_sessions_tb` |
| `V2__fix_ip_address_type.sql` | user | Fix columna `ip_address` de `inet` a `varchar(45)` |
| `V1__create_product_tables.sql` | product | `authors_tb`, `products_tb`, `product_tags_tb`, triggers |
| `V2__insert_test_data.sql` | product | 7 autores + 15 libros de literatura latinoamericana |
| `V1__create_cart_tables.sql` | cart | `cart_tb`, `carrito_items_tb` |
| `V1__create_inventory_tables.sql` | inventory | `inventory_tb` |
| `V2__insert_test_data.sql` | inventory | 15 registros de stock para productos de prueba |
| `V1__create_order_tables.sql` | order | `order_tb`, `orden_items_tb` |

### Problemas de BD detectados

1. ~~**`create-drop` en inventory y cart**~~ → **CORREGIDO**: migrado a Flyway con `validate`
2. ~~**Order-microservice sin conexión a BD**~~ → **CORREGIDO**
3. **IDs hardcodeados entre services** → `V2__insert_test_data.sql` usa `inventario_id = 101..115` que debe coincidir con IDs en `inventory` V2
4. ~~**Sin Flyway en inventory y cart**~~ → **CORREGIDO**: ambos tienen migraciones Flyway V1 (+ V2 para inventory)
5. ~~**Sin índice en order_tb.usuario_id**~~ → **CORREGIDO**: índice `idx_orden_usuario` agregado en V1
6. **Orden inconsistente en tipos de fecha:** algunos usan `LocalDateTime`, otros `Instant`

---

## 5. Errores que Requieren Atención

### 🔴 Críticos (bloquean el funcionamiento)

| # | Error | Impacto | Localización |
|---|---|---|---|
| 1 | ~~**Build context mismatch en Docker**~~ | **CORREGIDO**: `docker compose build` funciona para todos los servicios | `docker-compose.yml` + todos los Dockerfiles |
| 2 | ~~**Order-microservice sin configuración**~~ | **CORREGIDO**: config-server, datasource, Eureka, Flyway | `order-microservice/` |
| 3 | ~~**Order-microservice no está en docker-compose**~~ | **CORREGIDO**: ya incluido en docker-compose | `docker-compose.yml` |
| 4 | ~~**Falta ruta de order en API Gateway**~~ | **CORREGIDO**: ruta `/api/v1/orders/**` configurada | `api-gateway.yml` (config-server/configs) |

### 🟡 Altos (deuda técnica severa)

| # | Error | Impacto | Localización |
|---|---|---|---|
| 5 | ~~`ddl-auto: create-drop` en inventory y cart~~ | **CORREGIDO**: cambiado a `validate` con Flyway | Config server → `inventory-microservice.yml`, `cart-microservice.yml` |
| 6 | ~~Sin Flyway en inventory y cart~~ | **CORREGIDO**: migraciones V1 (+V2 en inventory) añadidas | POM + `db/migration/` de ambos servicios |
| 7 | Gateway sin autenticación (`permitAll()`) | Cualquier request externo accede a todo | `api-gateway/SecurityConfig.java` |
| 8 | JWT secret hardcodeado y débil | Riesgo de seguridad crítico | `user-microservice.yml` (config-server) |
| 9 | Passwords de BD hardcodeadas en config | Exposición de credenciales | Todos los config `.yml` |
| 10 | Cart `_db` sin migración Flyway | **CORREGIDO**: cart tiene migración V1 | `cart-microservice/` |
| 10b | ~~Order `_db` sin migración Flyway~~ | **CORREGIDO**: order tiene migración V1 | `order-microservice/` |
| 10c | ~~**Feign PATCH no soportado**~~ | **CORREGIDO**: agregado `feign-hc5` + `httpclient5` | `cart-microservice/pom.xml` |
| 10d | ~~**`numeroOrden` null al crear orden**~~ | **CORREGIDO**: agregado `.numeroOrden(UUID.randomUUID().toString())` en builder | `OrderServiceImpl.java:72` |
| 10e | **Build context de Docker (ya corregido)** | `docker compose build` funciona con Docker Compose V2 | Dockerfiles multi-etapa |
| 10f | **`creadoEn` null en response de Order** | Hibernate no refresca columna con `DEFAULT` tras insert | `Order.java` sin `@CreationTimestamp` |

### 🟢 Medios (mejores prácticas)

| # | Error | Impacto | Localización |
|---|---|---|---|
| 11 | `CartServiceImpl.addProductToCart()` sin lock pesimista | Race condition en carrito | `CartServiceImpl.java` |
| 26 | `@Builder` ignora field initializers | `numeroOrden` se inserta como null con `@Builder` | `Order.java` + `OrderServiceImpl.java` |
| 12 | `UserServiceImpl.login()` con race condition en incremento de intentos | Doble incremento de failed_attempts | `UserServiceImpl.java` |
| 13 | `unlockExpiredAccounts()` nunca se ejecuta (sin `@Scheduled`) | Cuentas bloqueadas para siempre | `UserServiceImpl.java` |
| 14 | Schema URL typo en POMs: `apach` en vez de `apache` | Warnings de IDE | Todos los `pom.xml` de servicios |
| 15 | `spring.sql.init.mode: always` con Flyway | Configuración redundante | `user-microservice.yml`, `product-microservice.yml` |
| 16 | IDs hardcodeados entre product e inventory | Acoplamiento frágil entre servicios | `V2__insert_test_data.sql` + `import.sql` |
| 17 | `precioReferencia` sin null-check en `CartServiceImpl.mapToResponse()` | Potencial NullPointerException | `CartServiceImpl.java` |
| 18 | CORS hardcodeado a `http://localhost:3000` (frontend corre en :5173) | No funciona en producción/distintos entornos | `user-microservice/SecurityConfig.java` |
| 19 | `ENTRYPOINT` duplicado en order Dockerfile | Línea 19 invalida a línea 17 (confuso) | `order-microservice/Dockerfile` |
| 20 | `api-gateway/Dockerfile` compila `common-exception` | Innecesario (api-gateway no depende de common-exception) | `api-gateway/Dockerfile` |
| 21 | ~~Nombre de carpeta mal escrito: `analitycs-dashboard`~~ | **CORREGIDO** - Renombrado a `analytics-dashboard` | `analytics-dashboard/` |
| 22 | Dashboard accede a BD directamente | Viola el patrón microservicios, problemas de seguridad | `app.py` |
| 23 | Sin archivos `.dockerignore` | Build context innecesariamente grande | Todos los servicios |
| 24 | `FeignException.status()` puede devolver `-1` | Error Map con valor inválido | `GlobalExceptionHandler.java` |
| 25 | `GlobalExceptionHandler` no maneja `AccessDeniedException`, `AuthenticationException` | Errores de seguridad sin formato consistente | `GlobalExceptionHandler.java` |

---

## 6. Posibles Mejoras

### Arquitectura
- [ ] Agregar **Circuit Breaker** (Resilience4j) en todos los Feign clients
- [ ] Implementar **arquitectura orientada a eventos** con RabbitMQ/Kafka para operaciones asíncronas (ej: crear orden → reducir stock → notificar)
- [ ] Agregar **trazabilidad distribuida** con Micrometer Tracing + Zipkin
- [ ] Migrar comunicación entre servicios de Feign (síncrono) a eventos para operaciones críticas
- [ ] Implementar **API Composition** o **CQRS** para consultas que cruzan servicios

### Infraestructura
- [ ] Agregar **Rate Limiting** en API Gateway
- [ ] Configurar HTTPS/TLS en el gateway
- [ ] Migrar Config Server a backend Git (en vez de `native`)
- [ ] Agregar archivo `.env` real para desarrollo local
- [ ] Agregar **health endpoints personalizados** con Spring Boot Actuator

### Seguridad
- [ ] Implementar autenticación en API Gateway via **OAuth2 Resource Server** (dependencia ya incluida)
- [ ] Externalizar JWT secret a variable de entorno o HashiCorp Vault
- [ ] Externalizar TODAS las contraseñas de base de datos
- [ ] Agregar `@PreAuthorize` / `@Secured` en endpoints sensibles (ej: solo ADMIN puede crear productos)
- [ ] Rotación de claves JWT con soporte para múltiples claves activas
- [ ] Agregar validación de roles en el gateway para filtrar requests antes de llegar al microservicio
- [ ] Implementar **CSRF protection** (actualmente deshabilitado)

### Base de Datos
- [ ] **Unificar estrategia de migraciones**: Flyway para TODOS los servicios
- [ ] Reemplazar `ddl-auto: create-drop` por `validate` con Flyway en inventory y cart
- [ ] Agregar índices en foreign keys (`usuario_id`, `producto_id`) en todas las tablas
- [ ] Usar IDs relativos (secuencias) en lugar de IDs hardcodeados en datos de prueba
- [ ] Separar datos de prueba en perfiles (no en migraciones de producción)
- [x] Completar order-microservice con su migración Flyway, repositorio, servicio y controlador

### Calidad de Código
- [ ] Agregar **pruebas unitarias** reales (actualmente todos los tests están vacíos)
- [ ] Agregar **pruebas de integración** con Testcontainers
- [ ] Configurar CI/CD con **GitHub Actions**
- [ ] Agregar linters: **Checkstyle** para Java, **flake8/pylint** para Python
- [ ] Agregar `@PrePersist` / `@PreUpdate` en entidades para valores por defecto (evitar dependencia de builders/field initializers)
- [ ] Estandarizar tipos de fecha: usar `LocalDateTime` con zonas horarias explícitas
- [ ] Internacionalizar mensajes de error (actualmente en español hardcodeado)
- [ ] Agregar `@Scheduled` para desbloqueo automático de cuentas
- [ ] Agregar logs estructurados (JSON) para mejor integración con sistemas de monitoreo

### Operaciones y DevOps
- [ ] Agregar archivos `.dockerignore` en cada servicio
- [ ] Reducir tiempo de build en Dockerfiles multi-stage (optimizar capas)
- [ ] Configurar **Docker Compose profiles** para desarrollo vs producción
- [ ] Dashboard de analíticas debería consultar los microservicios via API Gateway, no las BD directamente
- [ ] Agregar **health check endpoints** personalizados en cada servicio
- [ ] Agregar **backup automático** de las bases de datos PostgreSQL

---

## Resumen de Prioridades

```
Prioridad          Acción                                                       Esfuerzo
─────────────────────────────────────────────────────────────────────────────────────────
🟢 CORREGIDO  2. Configurar order-microservice (BD, Eureka, config, gateway)       Media ✅
🟢 CORREGIDO  3. Reemplazar create-drop con Flyway en inventory y cart              Media ✅
🟡 ALTO       4. Implementar autenticación en API Gateway                           Alta
🟡 ALTO       5. Externalizar secrets (JWT, DB passwords)                           Baja
🟢 MEDIO      6. Agregar índices y migraciones faltantes                            Baja
🟢 MEDIO      7. Fix race conditions en cart y user services                        Media
🟢 MEDIO      8. Agregar scheduler para desbloqueo de cuentas                       Baja
⚪ MEJORA     9. Implementar event-driven para operaciones críticas                 Alta
⚪ MEJORA    10. Agregar CI/CD, tests, y linters                                    Alta
```

---

*Documento generado el 17/05/2026 — actualizado el 21/05/2026*
