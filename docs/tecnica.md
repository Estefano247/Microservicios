# Documentación Técnica - Microservicios Librería

## Diagrama de Clases UML

### 1. User Microservice

```mermaid
classDiagram
    class User {
        +Long id
        +String name
        +String lastName
        +String email
        +String password
        +String phone
        +boolean enabled
        +LocalDate birthday
        +Role role
        +boolean emailVerified
        +LocalDateTime lastLogin
        +Integer failedAttempts
        +LocalDateTime lockTime
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }
    class UserSession {
        +Long id
        +String tokenHash
        +String ipAddress
        +String userAgent
        +LocalDateTime expiresAt
        +LocalDateTime createdAt
    }
    class PasswordHistory {
        +Long id
        +String passwordHash
        +LocalDateTime createdAt
    }
    class Role {
        <<enumeration>>
        CUSTOMER
        ADMIN
        SELLER
    }
    class RegisterRequest {
        +String name
        +String lastName
        +String email
        +String password
        +String confirmPassword
        +String phone
        +LocalDate birthday
    }
    class LoginRequest {
        +String email
        +String password
    }
    class AuthenticationResponse {
        +String token
        +String type
        +String email
        +Role role
        +String message
    }
    class UserResponse {
        +Long id
        +String name
        +String lastName
        +String email
        +String phone
        +Role role
        +LocalDate birthday
        +Boolean emailVerified
        +LocalDateTime createdAt
        +LocalDateTime lastLogin
    }
    User "1" --> "*" UserSession : sessions
    User "1" --> "*" PasswordHistory : passwordHistory
    User --> Role
    RegisterRequest ..> User : creates
    LoginRequest ..> AuthenticationResponse : generates
    UserResponse ..> User : maps from
```

### 2. Product Microservice

```mermaid
classDiagram
    class Product {
        +Long id
        +String isbn
        +String titulo
        +String descripcion
        +BigDecimal precio
        +Integer paginas
        +Integer anioPublicacion
        +String imageUrl
        +Category categoria
        +ProductType tipo
        +Long inventarioId
        +Boolean isActive
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }
    class Author {
        +Long id
        +String nombre
        +Integer anioNacimiento
        +Integer anioDefuncion
        +String paisOrigen
        +String sexo
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }
    class ProductTag {
        +Long id
        +String tag
    }
    class Category {
        <<enumeration>>
        NOVELA
        CIENCIA_FICCION
        FICCION
        HISTORIA
        BIOGRAFIA
        POESIA
        INFANTIL
        TECNICO
        ENSAYO
        MISTERIO
        DRAMA
        FANTASIA
        ROMANCE
        COMEDIA
    }
    class ProductType {
        <<enumeration>>
        FISICO
        DIGITAL
        AUDIO_LIBRO
    }
    class ProductRequest {
        +String isbn
        +String titulo
        +String descripcion
        +Double precio
        +Integer paginas
        +Integer anioPublicacion
        +Integer initialStock
        +Category categoria
        +ProductType tipo
        +String imageUrl
        +Long authorId
        +Long inventarioId
    }
    class ProductResponse {
        +Long id
        +String isbn
        +String titulo
        +String descripcion
        +Double precio
        +Integer paginas
        +Integer anioPublicacion
        +Category categoria
        +ProductType tipo
        +AuthorSimpleResponse autor
        +Long inventarioId
        +Boolean isActive
    }
    class AuthorRequest {
        +String nombre
        +Integer anioNacimiento
        +Integer anioDefuncion
        +String paisOrigen
        +String sexo
    }
    class AuthorResponse {
        +Long id
        +String nombre
        +Integer anioNacimiento
        +Integer anioDefuncion
        +String paisOrigen
        +String sexo
        +List~ProductSimpleResponse~ libros
    }
    class AuthorSimpleResponse {
        +Long id
        +String nombre
    }
    class ProductSimpleResponse {
        +Long id
        +String titulo
        +String isbn
    }
    Product "*" --> "1" Author : author
    Product "1" --> "*" ProductTag : tags
    Product --> Category
    Product --> ProductType
    Author "1" --> "*" Product : libros
    AuthorResponse *--> "*" ProductSimpleResponse : libros
    ProductResponse *--> "1" AuthorSimpleResponse : autor
```

### 3. Inventory Microservice

```mermaid
classDiagram
    class Inventory {
        +Long id
        +Integer cantidad
        +Integer minStock
        +Integer maxStock
        +LocalDateTime fechaUltimaEntrada
        +String ubicacion
        +Long productoId
    }
    class InventoryRequest {
        +Long productId
        +Integer cantidad
        +Integer minStock
        +Integer maxStock
        +String ubicacion
    }
    class InventoryResponse {
        +Long id
        +Long productId
        +Integer cantidad
        +Integer minStock
        +Integer maxStock
        +LocalDateTime fechaUltimaEntrada
        +String ubicacion
    }
    InventoryResponse ..> Inventory : maps from
    InventoryRequest ..> Inventory : creates
```

### 4. Cart Microservice

```mermaid
classDiagram
    class Cart {
        +Long id
        +Long usuarioId
        +List~CartItem~ items
        +Instant actualizadoEn
       }
    class CartItem {
        <<embeddable>>
        +Long productoId
        +Integer cantidad
        +BigDecimal precioReferencia
        +String metadatos
    }
    class AddToCartRequest {
        +Long productoId
        +Integer cantidad
    }
    class CartResponse {
        +Long id
        +Long usuarioId
        +List~CartItemResponse~ items
        +BigDecimal total
    }
    class CartItemResponse {
        +Long productoId
        +String titulo
        +Integer cantidad
        +BigDecimal precioUnitario
        +BigDecimal subtotal
    }
    Cart "1" *--> "*" CartItem : items
    CartResponse *--> "*" CartItemResponse : items
```

### 5. Order Microservice

```mermaid
classDiagram
    class Order {
        +Long id
        +String numeroOrden
        +Long usuarioId
        +List~OrderItem~ items
        +BigDecimal total
        +EstadoOrden estado
        +Instant creadoEn
    }
    class OrderItem {
        <<embeddable>>
        +Long productoId
        +Integer cantidad
        +BigDecimal precioCaptura
        +BigDecimal subtotal
    }
    class EstadoOrden {
        <<enumeration>>
        PENDIENTE
        PAGO_PENDIENTE
        RESERVADO
        COMPLETADO
        CANCELADO
        FALLIDO
    }
    class CreateOrderRequest {
        +Long usuarioId
    }
    class OrderResponse {
        +Long id
        +String numeroOrden
        +Long usuarioId
        +List~OrderItemResponse~ items
        +BigDecimal total
        +String estado
        +Instant creadoEn
    }
    class OrderItemResponse {
        +Long productoId
        +String titulo
        +Integer cantidad
        +BigDecimal precioCaptura
        +BigDecimal subtotal
    }
    class UpdateOrderStatusRequest {
        +String estado
    }
    Order "1" *--> "*" OrderItem : items
    Order --> EstadoOrden
    OrderResponse *--> "*" OrderItemResponse : items
    CreateOrderRequest ..> Order : creates
    UpdateOrderStatusRequest ..> Order : updates
```

## Diagrama de Componentes

```mermaid
graph TB
    subgraph "API Gateway :8080"
        GW[Spring Cloud Gateway]
        JWT[JwtAuthenticationFilter]
    end

    subgraph "Infraestructura"
        CS[Config Server :8888]
        DS[Discovery Server :8761]
        PG[(PostgreSQL 15)]
    end

    subgraph "Microservicios"
        US[User Microservice :8091]
        PM[Product Microservice :8092]
        IM[Inventory Microservice :8093]
        CM[Cart Microservice :8094]
        OM[Order Microservice :8095]
    end

    subgraph "Analytics"
        AD[Analytics Dashboard :8501]
    end

    US --> PG
    PM --> PG
    IM --> PG
    CM --> PG
    OM --> PG

    US --> DS
    PM --> DS
    IM --> DS
    CM --> DS
    OM --> DS
    GW --> DS

    PM -.->|Feign| IM
    CM -.->|Feign| PM
    CM -.->|Feign| IM
    OM -.->|Feign| CM
    OM -.->|Feign| PM
    OM -.->|Feign| IM

    AD -.->|Direct SQL| PG

    GW --> US
    GW --> PM
    GW --> IM
    GW --> CM
    GW --> OM

    CS -.->|Config| US
    CS -.->|Config| PM
    CS -.->|Config| IM
    CS -.->|Config| CM
    CS -.->|Config| OM
    CS -.->|Config| GW
```

## Diagrama de Secuencia - Creación de Pedido

```mermaid
sequenceDiagram
    actor Usuario
    participant GW as API Gateway
    participant Cart as Cart Microservice
    participant Product as Product Microservice
    participant Inv as Inventory Microservice
    participant Order as Order Microservice

    Usuario->>GW: POST /api/v1/cart/usuario/1/items
    GW->>GW: Validar JWT
    GW->>Cart: Reenviar request
    Cart->>Product: Feign: getProductById(1)
    Product-->>Cart: ProductResponse
    Cart->>Inv: Feign: getInventoryByProductId(1)
    Inv-->>Cart: InventoryResponse (cantidad=10)
    Cart->>Cart: Agregar item a carrito
    Cart->>Inv: Feign: PATCH /inventory/101/reduce?quantity=2
    Inv-->>Cart: Stock reducido
    Cart-->>GW: CartResponse
    GW-->>Usuario: 200 OK

    Usuario->>GW: POST /api/v1/orders
    GW->>GW: Validar JWT
    GW->>Order: Reenviar request
    Order->>Cart: Feign: getCartByUsuario(1)
    Cart-->>Order: CartResponse (items=[])
    alt Carrito vacío
        Order-->>GW: 400 Bad Request
        GW-->>Usuario: Error
    else Carrito con items
        Order->>Order: Crear entidad Order
        Order->>Order: Persistir orden + items
        Order->>Inv: Feign: PATCH reduceStock por cada item
        Order->>Cart: Feign: clearCart(1)
        Order-->>GW: OrderResponse
        GW-->>Usuario: 201 Created
    end
```

## Diagrama de Secuencia - Autenticación

```mermaid
sequenceDiagram
    actor Usuario
    participant GW as API Gateway
    participant UserSvc as User Microservice
    participant BD as Base de Datos

    Usuario->>GW: POST /api/v1/users/auth (register)
    GW->>UserSvc: Reenviar request
    UserSvc->>UserSvc: Validar datos
    UserSvc->>BD: Verificar email único
    BD-->>UserSvc: OK
    UserSvc->>BD: INSERT users_tb
    UserSvc->>BD: INSERT user_sessions_tb
    UserSvc->>UserSvc: Generar JWT
    UserSvc-->>GW: AuthenticationResponse (token)
    GW-->>Usuario: 200 + JWT

    Usuario->>GW: POST /api/v1/users/auth (login)
    GW->>UserSvc: Reenviar request
    UserSvc->>BD: SELECT usuario por email
    BD-->>UserSvc: User
    UserSvc->>UserSvc: Validar password
    alt Credenciales inválidas
        UserSvc->>BD: Incrementar failedAttempts
        alt failedAttempts >= 3
            UserSvc->>BD: Set lockTime
            UserSvc-->>GW: 403 Blocked
        else
            UserSvc-->>GW: 401 Unauthorized
        end
    else Credenciales válidas
        UserSvc->>BD: Reset failedAttempts
        UserSvc->>BD: INSERT user_sessions_tb
        UserSvc->>UserSvc: Generar JWT
        UserSvc-->>GW: AuthenticationResponse (token)
        GW-->>Usuario: 200 + JWT
    end
```

## Modelo de Datos Relacional

```mermaid
erDiagram
    users_tb {
        BIGINT id PK
        VARCHAR name
        VARCHAR last_name
        VARCHAR email UK
        VARCHAR password
        VARCHAR phone UK
        BOOLEAN enabled
        DATE birthday
        VARCHAR role
        BOOLEAN email_verified
        TIMESTAMP last_login
        INTEGER failed_attempts
        TIMESTAMP lock_time
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    user_sessions_tb {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR token_hash
        VARCHAR ip_address
        TEXT user_agent
        TIMESTAMP expires_at
        TIMESTAMP created_at
    }
    password_history_tb {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR password_hash
        TIMESTAMP created_at
    }
    authors_tb {
        BIGINT id PK
        VARCHAR nombre
        INTEGER anio_nacimiento
        INTEGER anio_defuncion
        VARCHAR pais_origen
        VARCHAR sexo
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    products_tb {
        BIGINT id PK
        VARCHAR isbn UK
        VARCHAR titulo
        TEXT descripcion
        DECIMAL precio
        INTEGER paginas
        INTEGER anio_publicacion
        VARCHAR image_url
        VARCHAR categoria
        VARCHAR tipo
        BIGINT author_id FK
        BIGINT inventario_id
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    product_tags_tb {
        BIGINT id PK
        BIGINT product_id FK
        VARCHAR tag
    }
    inventory_tb {
        BIGINT id PK
        INTEGER cantidad
        INTEGER min_stock
        INTEGER max_stock
        TIMESTAMP fecha_ultima_entrada
        VARCHAR ubicacion
        BIGINT producto_id
    }
    order_tb {
        BIGINT id PK
        VARCHAR numero_orden UK
        BIGINT usuario_id
        DECIMAL total
        VARCHAR estado
        TIMESTAMP creado_en
    }
    orden_items_tb {
        BIGINT orden_id FK
        BIGINT producto_id
        INTEGER cantidad
        DECIMAL precio_captura
        DECIMAL subtotal
    }
    cart_tb {
        BIGINT id PK
        BIGINT usuario_id
        TIMESTAMPTZ actualizado_en
    }
    carrito_items_tb {
        BIGINT carrito_id FK
        BIGINT producto_id
        INTEGER cantidad
        DECIMAL precio_referencia
        VARCHAR metadatos
    }

    users_tb ||--o{ user_sessions_tb : tiene
    users_tb ||--o{ password_history_tb : registra
    authors_tb ||--o{ products_tb : escribe
    products_tb ||--o{ product_tags_tb : etiqueta
    products_tb ||--o| inventory_tb : stock
    order_tb ||--o{ orden_items_tb : contiene
    cart_tb ||--o{ carrito_items_tb : contiene
```

## Endpoints de la API

### User Microservice (`/api/v1/users`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth` | Registrar o iniciar sesión | No |
| GET | `/me` | Perfil del usuario autenticado | JWT |
| PATCH | `/me/password` | Cambiar contraseña | JWT |
| GET | `/me/sessions` | Listar sesiones activas | JWT |
| DELETE | `/me/sessions/{id}` | Cerrar sesión específica | JWT |

### Product Microservice (`/api/v1/products`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Listar productos (paginado) | JWT |
| GET | `/{id}` | Obtener producto por ID | JWT |
| POST | `/` | Crear producto | JWT |
| PUT | `/{id}` | Actualizar producto | JWT |
| DELETE | `/{id}` | Eliminar producto | JWT |
| GET | `/authors` | Listar autores | JWT |
| GET | `/authors/{id}` | Obtener autor por ID | JWT |
| POST | `/authors` | Crear autor | JWT |
| PUT | `/authors/{id}` | Actualizar autor | JWT |
| DELETE | `/authors/{id}` | Eliminar autor | JWT |

### Inventory Microservice (`/api/v1/inventory`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Listar todo el inventario | JWT |
| GET | `/{id}` | Obtener inventario por ID | JWT |
| GET | `/product/{productId}` | Obtener inventario por producto | JWT |
| POST | `/` | Crear registro de inventario | JWT |
| PUT | `/{id}` | Actualizar inventario | JWT |
| DELETE | `/{id}` | Eliminar inventario | JWT |
| PATCH | `/{id}/reduce?quantity=n` | Reducir stock | JWT |
| PATCH | `/{id}/add?quantity=n` | Aumentar stock | JWT |

### Cart Microservice (`/api/v1/cart`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/usuario/{usuarioId}` | Obtener carrito del usuario | JWT |
| POST | `/usuario/{usuarioId}/items` | Agregar producto al carrito | JWT |
| DELETE | `/usuario/{usuarioId}` | Vaciar carrito | JWT |
| DELETE | `/usuario/{usuarioId}/items/{productoId}` | Eliminar item del carrito | JWT |

### Order Microservice (`/api/v1/orders`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/` | Crear orden desde el carrito | JWT |
| GET | `/` | Listar todas las órdenes (admin) | JWT |
| GET | `/{id}` | Obtener orden por ID | JWT |
| GET | `/numero/{numeroOrden}` | Obtener orden por UUID | JWT |
| GET | `/usuario/{usuarioId}` | Órdenes del usuario (paginado) | JWT |
| PATCH | `/{id}/estado` | Actualizar estado de orden | JWT |
| DELETE | `/{id}` | Cancelar orden (restaura stock) | JWT |

## Comunicación entre Servicios (Feign)

| Origen | Destino | Método | Endpoint |
|--------|---------|--------|----------|
| Product Microservice | Inventory Microservice | GET | `/api/v1/inventory/product/{productId}` |
| Cart Microservice | Product Microservice | GET | `/api/v1/products/{id}` |
| Cart Microservice | Inventory Microservice | GET | `/api/v1/inventory/product/{productId}` |
| Cart Microservice | Inventory Microservice | PATCH | `/api/v1/inventory/{id}/reduce` |
| Order Microservice | Cart Microservice | GET | `/api/v1/cart/usuario/{usuarioId}` |
| Order Microservice | Cart Microservice | DELETE | `/api/v1/cart/usuario/{usuarioId}` |
| Order Microservice | Product Microservice | GET | `/api/v1/products/{id}` |
| Order Microservice | Inventory Microservice | PATCH | `/api/v1/inventory/{id}/reduce` |
| Order Microservice | Inventory Microservice | PATCH | `/api/v1/inventory/{id}/add` |

## Migraciones Flyway

| Microservicio | Migraciones | Descripción |
|--------------|-------------|-------------|
| user-microservice | V1, V2 | Tablas de usuarios, sesiones, historial; fix tipo ip_address |
| product-microservice | V1, V2 | Tablas de productos, autores, tags; datos de prueba (15 libros) |
| inventory-microservice | V1, V2 | Tabla de inventario; datos de prueba (15 registros) |
| cart-microservice | V1 | Tablas de carrito e items |
| order-microservice | V1 | Tablas de órdenes e items |

## Puertos y Dependencias

| Servicio | Puerto | Depende de |
|----------|--------|------------|
| postgres | 5432 | - |
| config-server | 8888 | postgres |
| discovery-server | 8761 | config-server |
| user-microservice | 8091 | config-server, discovery-server, postgres |
| product-microservice | 8092 | config-server, discovery-server, postgres |
| inventory-microservice | 8093 | config-server, discovery-server, postgres |
| cart-microservice | 8094 | config-server, discovery-server, postgres, product, inventory |
| order-microservice | 8095 | config-server, discovery-server, postgres, cart, product, inventory |
| api-gateway | 8080 | config-server, discovery-server, todos los microservicios |
| analytics-dashboard | 8501 | postgres |

## Issues Conocidos

| # | Descripción | Severidad |
|---|-------------|-----------|
| 1 | Gateway sin autenticación (`permitAll()`) | Alta |
| 2 | JWT secret hardcodeado y débil | Alta |
| 3 | Passwords de BD hardcodeadas en config-server | Alta |
| 4 | Race condition en `CartServiceImpl.addProductToCart()` | Media |
| 5 | Race condition en `UserServiceImpl.login()` | Media |
| 6 | `@Scheduled` faltante para desbloquear cuentas | Media |
| 7 | `creadoEn` null en response de Order (falta `@CreationTimestamp`) | Baja |
| 8 | `@Builder` ignora field initializers (`numeroOrden`) | Baja |
| 9 | CORS hardcodeado a `http://localhost:3000` (frontend corre en :5173) | Baja |
| 10 | ~~Nombre de carpeta mal escrito: `analitycs-dashboard`~~ | **CORREGIDO** |
