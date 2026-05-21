# ECOMMERCE - Microservicios Librería

Arquitectura de microservicios para una librería/tienda online construida con **Java 21**, **Spring Boot 3.3.1** y **Spring Cloud 2023.0.2**.

## Stack tecnológico

- Java 21 + Spring Boot 3.3.1 + Spring Cloud 2023.0.2
- Spring Cloud Gateway (API Gateway, puerto 8080)
- Spring Cloud Config Server (Configuración centralizada, puerto 8888)
- Spring Cloud Netflix Eureka (Service Discovery, puerto 8761)
- Spring Data JPA / Hibernate + Flyway
- PostgreSQL 15
- Spring Security + JWT
- Spring Cloud OpenFeign (comunicación entre servicios)
- SpringDoc OpenAPI (Swagger UI)
- Python 3.9 + Streamlit (Dashboard de análisis)

## Servicios

| Servicio | Puerto | DB | Estado |
|---|---|---|---|
| config-server | 8888 | - | Completo |
| discovery-server | 8761 | - | Completo |
| api-gateway | 8080 | - | Completo |
| user-microservice | 8091 | user_db | Completo |
| product-microservice | 8092 | product_db | Completo |
| inventory-microservice | 8093 | inventory_db | Completo |
| cart-microservice | 8094 | cart_db | Completo |
| order-microservice | 8095 | order_db | Completo |
| analytics-dashboard | 8501 | (directo DB) | Completo |

## Estructura del proyecto

```
E:\Microservicios\
├── config-server/          Servidor de configuración
├── discovery-server/       Servicio de descubrimiento (Eureka)
├── microservices/          Módulos de negocio
│   ├── api-gateway/        Puerta de enlace
│   ├── user-microservice/  Gestión de usuarios y autenticación
│   ├── product-microservice/  Catálogo de productos
│   ├── inventory-microservice/  Control de stock
│   ├── cart-microservice/  Carrito de compras
│   ├── order-microservice/  Gestión de pedidos
│   └── common-exception/   Librería compartida de errores
├── analitycs-dashboard/    Dashboard de análisis (Python/Streamlit)
├── postgres-init/          Scripts de inicialización de BD
├── docs/                   Documentación del proyecto
├── docker-compose.yml      Orquestación completa
└── pom.xml                 Proyecto raíz Maven
```

## Comunicación entre servicios (OpenFeign)

- `product-microservice` --Feign--> `inventory-microservice` (consulta stock)
- `cart-microservice` --Feign--> `product-microservice` (detalle producto)
- `cart-microservice` --Feign--> `inventory-microservice` (descuenta stock)
- `order-microservice` --Feign--> `cart-microservice` (obtener/vaciar carrito)
- `order-microservice` --Feign--> `product-microservice` (detalle producto)
- `order-microservice` --Feign--> `inventory-microservice` (reducir/restaurar stock)

## Endpoints de la API (a través de api-gateway:8080)

| Ruta | Destino |
|---|---|---|
| `/api/v1/users/**` | user-microservice |
| `/api/v1/products/**` | product-microservice |
| `/api/v1/inventory/**` | inventory-microservice |
| `/api/v1/cart/**` | cart-microservice |
| `/api/v1/orders/**` | order-microservice |
| `/*-docs/**` | Swagger UI de cada servicio |

## Cómo ejecutar

1. **Requisitos:** Docker y Docker Compose
2. **Variables de entorno:** copiar `.env.example` a `.env` y configurar
3. **Levantar servicios:**
   ```bash
   docker compose up -d
   ```
4. El API Gateway estará disponible en `http://localhost:8080`

## Endpoints verificados

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/v1/users/auth` | POST | Register / Login (JWT) |
| `/api/v1/users/me` | GET | Perfil del usuario autenticado |
| `/api/v1/products` | GET | Listar productos (paginado) |
| `/api/v1/inventory` | GET | Listar inventario |
| `/api/v1/cart/usuario/{id}` | GET | Obtener carrito del usuario |
| `/api/v1/cart/usuario/{id}/items` | POST | Agregar producto al carrito |
| `/api/v1/orders` | POST | Crear orden desde el carrito |
| `/api/v1/orders/usuario/{id}` | GET | Órdenes del usuario (paginado) |

## Notas

- `analytics-dashboard` tiene typo en el nombre del directorio (`analitycs-dashboard`)
- Las contraseñas y JWT secret están hardcodeados en los YAML de config-server
- No hay circuit breaker (Resilience4j) implementado aún
- Todos los microservicios con BD usan Flyway para migraciones (`ddl-auto: validate`)
  - ✅ user-microservice: V1 + V2 (fix `ip_address` type)
  - ✅ product-microservice: V1 + V2
  - ✅ inventory-microservice: V1 + V2
  - ✅ cart-microservice: V1
  - ✅ order-microservice: V1
