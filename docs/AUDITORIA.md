# Auditoría de Incidencias - Libreria Store

## Resumen

Documentación de incidencias encontradas y soluciones aplicadas durante la revisión del sistema.

---

## 1. Error: `"undefined" is not valid JSON` al cargar la página

### Síntoma
```
(index):1 Uncaught SyntaxError: "undefined" is not valid JSON
    at JSON.parse (<anonymous>)
```

### Causa
En `src/contexts/AuthContext.jsx:9`, el estado `user` se inicializaba con `JSON.parse(localStorage.getItem('user'))` sin protección. Si `localStorage` contenía el string literal `"undefined"` (por ejemplo, de una escritura previa con `setItem('user', undefined)`), `JSON.parse("undefined")` fallaba.

### Solución
Envolver el `JSON.parse` en un `try/catch`:

```js
try { return saved ? JSON.parse(saved) : null; } catch { return null; }
```

### Archivo modificado
- `libreria-frontend/src/contexts/AuthContext.jsx` — línea 9

---

## 2. Error: `400 Bad Request` en `POST /api/v1/users/auth/login`

### Síntoma
```
POST /api/v1/users/auth/login 400 (Bad Request)
```

### Causa
El `UserExceptionHandler` mapeaba todas las `BusinessException` a HTTP 400. Cuando el login fallaba (credenciales inválidas), el servicio lanzaba `BusinessException("Credenciales inválidas")`, resultando en 400 en vez de 401.

### Solución
1. Se creó `InvalidCredentialsException` que extiende `BusinessException`.
2. El `UserServiceImpl.login()` ahora lanza `InvalidCredentialsException` en vez de `BusinessException` genérica.
3. El `UserExceptionHandler` mapea `InvalidCredentialsException` a HTTP 401.

### Archivos modificados
- `microservices/user-microservice/.../exception/InvalidCredentialsException.java` — nuevo
- `microservices/user-microservice/.../impl/UserServiceImpl.java` — líneas 104, 108, 117
- `microservices/user-microservice/.../exception/UserExceptionHandler.java` — línea 35

---

## 3. Redirección de Admin al Dashboard después del Login

### Síntoma
Al iniciar sesión como admin, se redirigía al catálogo general (`/`) en vez del panel de administración.

### Solución
En `Login.jsx`, después del login exitoso se verifica el rol:

```js
const res = await login(form);
if (res.role === 'ADMIN') navigate('/admin');
else navigate(searchParams.get('redirect') || '/');
```

### Archivo modificado
- `libreria-frontend/src/pages/public/Login.jsx` — línea 23

---

## 4. Error: `400 Bad Request` en `PATCH /api/v1/orders/{id}/estado`

### Síntoma
```
PATCH /api/v1/orders/7/estado 400 (Bad Request)
PATCH /api/v1/orders/11/estado 400 (Bad Request)
```

### Causa
El frontend enviaba `"PENDIENTE"` como estado válido, pero el backend no lo incluía en `VALID_TRANSITIONS`. El backend solo aceptaba: `PAGO_PENDIENTE`, `RESERVADO`, `COMPLETADO`, `CANCELADO`, `FALLIDO`.

### Solución
Agregar `"PENDIENTE"` al conjunto `VALID_TRANSITIONS`.

### Archivo modificado
- `microservices/order-microservice/.../impl/OrderServiceImpl.java` — línea 37

---

## 5. Error: `"Stock modi..." is not valid JSON` al modificar stock

### Síntoma
```
Unexpected token 'S', "Stock modi"... is not valid JSON
```

### Causa
Los endpoints `PATCH /inventory/{id}/add` y `PATCH /inventory/{id}/reduce` devolvían texto plano (`ResponseEntity<String>`) en vez de JSON. El frontend llamaba `res.json()` y fallaba.

### Solución
Cambiar el tipo de retorno a `ResponseEntity<Map<String, String>>` con `Map.of("message", mensaje)`.

### Archivo modificado
- `microservices/inventory-microservice/.../controller/InventoryController.java` — líneas 96-111

---

## 6. Healthcheck del Analytics Dashboard (contenedor unhealthy)

### Síntoma
```
libreria-store-main-analytics-dashboard  ...  Up 5 minutes (unhealthy)
```

### Causas
1. El healthcheck (`curl -f http://localhost:8501/_stcore/health`) no incluía el base path `/analytics`.
2. La imagen `python:3.9-slim` no tenía `curl` instalado.
3. El `--server.baseUrlPath=/analytics` provocaba 404 al acceder directamente a `http://localhost:8501/`.

### Solución
1. Se agregó `curl` al Dockerfile.
2. Se removió `--server.baseUrlPath=/analytics` del entrypoint de Streamlit.
3. Se actualizó el healthcheck a `http://localhost:8501/_stcore/health`.
4. Se cambió `StripPrefix=0` a `StripPrefix=1` en la ruta del API Gateway para el analytics.

### Archivos modificados
- `analytics-dashboard/Dockerfile` — línea 5 (agregar curl), línea 16 (remover baseUrlPath)
- `docker-compose.yml` — línea 265 (healthcheck URL)
- `config-server/src/main/resources/config/api-gateway.yml` — línea 49 (StripPrefix)

---

## 7. Advertencias DOM: autocomplete attributes

### Síntoma
```
[DOM] Input elements should have autocomplete attributes
```

### Causa
Los campos de contraseña en Login, Register y Profile no tenían el atributo `autocomplete`.

### Solución
Agregar `autoComplete` a todos los inputs de tipo password y email.

### Archivos modificados
- `libreria-frontend/src/pages/public/Login.jsx`
- `libreria-frontend/src/pages/public/Register.jsx`
- `libreria-frontend/src/pages/profile/Profile.jsx`

---

## 8. Rendimiento: click handler lento al agregar stock

### Síntoma
```
[Violation] 'click' handler took 4284ms
[Violation] 'click' handler took 3673ms
```

### Causa
Los microservicios del backend (inventory-microservice) responden lentamente o están cayendo (errores 502/503 previos). La petición `PATCH /inventory/{id}/add` tarda varios segundos en completarse.

### Estado
No requiere cambio de código. Depende de la estabilidad de los microservicios backend. Verificar que todos los contenedores estén saludables con `docker ps`.

---

## 9. Error: 502/503 en microservicios

### Síntoma
```
GET /api/v1/products 502 (Bad Gateway)
POST /api/v1/users/auth/login 503 (Service Unavailable)
GET /api/v1/cart/usuario/9 500 (Internal Server Error)
```

### Causa
Los microservicios no están disponibles o están crasheando. El API Gateway no puede redirigir las peticiones.

### Estado
Requiere revisar los logs de cada microservicio con `docker logs <container_name>` para identificar la causa raíz.

---

## Resumen de archivos modificados

| Archivo | Cambio |
|---|---|
| `libreria-frontend/src/contexts/AuthContext.jsx` | try/catch en JSON.parse |
| `libreria-frontend/src/pages/public/Login.jsx` | Redirección admin + autocomplete |
| `libreria-frontend/src/pages/public/Register.jsx` | autocomplete |
| `libreria-frontend/src/pages/profile/Profile.jsx` | autocomplete |
| `microservices/user-microservice/.../InvalidCredentialsException.java` | Nueva excepción |
| `microservices/user-microservice/.../UserServiceImpl.java` | InvalidCredentialsException |
| `microservices/user-microservice/.../UserExceptionHandler.java` | 401 para login fallido |
| `microservices/order-microservice/.../OrderServiceImpl.java` | Agregar PENDIENTE a transitions |
| `microservices/inventory-microservice/.../InventoryController.java` | JSON response en stock |
| `analytics-dashboard/Dockerfile` | curl + remover baseUrlPath |
| `docker-compose.yml` | Healthcheck URL |
| `config-server/src/main/resources/config/api-gateway.yml` | StripPrefix=1 |
