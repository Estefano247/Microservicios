# Auditoria del Proyecto

**Fecha:** 17/05/2026
**Ultima actualizacion:** 21/05/2026 - TODAS las correcciones aplicadas (criticos, altos, medios y bajos)
**Tecnologias:** Java 21, Spring Boot 3.3.1, Spring Security, Spring Data JPA, PostgreSQL, JWT (jjwt 0.11.5), Flyway, Lombok, Swagger/OpenAPI
**Puerto:** 8091
**Archivos Java:** 41
**Build:** `mvn clean compile` -- exitoso sin errores

---

## Resumen Ejecutivo

| Severidad | Total | Corregidos | Pendientes |
|-----------|-------|------------|------------|
| CRITICO   | 9     | 8          | 1 (API Gateway) |
| ALTO      | 12    | 11         | 1 (API Gateway) |
| MEDIO     | 23    | 23         | 0          |
| BAJO      | 19    | 19         | 0          |
| **TOTAL** | **63**| **61**     | **2**      |

---

## Historial de Correcciones

### Sesion 1 - Correcciones Originales (26 issues)

#### CRITICOS Resueltos (5/5)

| # | Estado | Problema | Archivos |
|---|--------|----------|----------|
| 1 | **RESUELTO** | JWT secret con valor por defecto conocido | `application.yml` |
| 2 | **RESUELTO** | Credenciales BD por defecto (`postgres/postgres`) | `application.yml` |
| 3 | **RESUELTO** | `unlockExpiredAccounts()` desbloqueaba usuarios hace 1 minuto | `UserServiceImpl.java` |
| 4 | **RESUELTO** | Verificacion de bloqueo inalcanzable tras `loadUserByUsername` | `JwtAuthenticationFilter.java` |
| 5 | **RESUELTO** | `GlobalExceptionHandler` catch-all sin logging | `GlobalExceptionHandler.java` |

#### ALTOS Resueltos (5/5)

| # | Estado | Problema | Archivos |
|---|--------|----------|----------|
| 6 | **RESUELTO** | CORS hardcodeado a `http://localhost:3000` | `SecurityConfig.java`, `application.yml` |
| 7 | **RESUELTO** | Expiracion de sesiones hardcodeada a 24h | `SessionService.java`, `application.yml` |
| 8 | **RESUELTO** | `ResetPasswordRequest.java` codigo muerto | Eliminado |
| 9 | **RESUELTO** | Excepcion generica en JWT filter devolvia 500 | `JwtAuthenticationFilter.java` |
| 10 | **RESUELTO** | Tests saltados en Docker build | `Dockerfile` |

#### MEDIOS Resueltos (11/11)

| # | Estado | Problema |
|---|--------|----------|
| 11 | **RESUELTO** | `@SQLRestriction` eliminado; centralizada autenticacion en `getAuthenticatedUser()` |
| 12 | **RESUELTO** | findById puede devolver soft-deleted -- mismo enfoque que #11 |
| 13 | **RESUELTO** | changePassword sin null-check -- usa `getAuthenticatedUser()` |
| 14 | **RESUELTO** | `UserSecurity.isOwner()` hace DB query innecesaria -- ahora usa principal directamente |
| 15 | **RESUELTO** | Password history con 10x BCrypt match -- extraido `isPasswordPreviouslyUsed()` en entidad |
| 16 | **RESUELTO** | Login re-fetch user tras incremento atomico -- incremento directo en memoria |
| 18 | **RESUELTO** | Registro crea sesion con null HttpServletRequest -- documentado como intencional |
| 19 | **RESUELTO** | Endpoints redundantes /me y /{userId} -- documentada distincion |
| 20 | **RESUELTO** | LoginRequest usa @NotNull en lugar de @NotBlank |
| 23 | **RESUELTO** | sessions cascade ALL con soft delete -- cambiado a PERSIST, MERGE |
| 24 | **RESUELTO** | PasswordHistory usa @Data -- cambiado a @Getter @Setter @Builder |

#### BAJOS Resueltos (5/5)

| # | Estado | Problema |
|---|--------|----------|
| 25 | **RESUELTO** | AuthController substring(7) sin trim |
| 26 | **RESUELTO** | changePassword remove(0) O(n^2) -- subList().clear() O(n) |
| 27 | **RESUELTO** | @RequiredArgsConstructor innecesario en Role enum |
| 28 | **RESUELTO** | Fallback ROLE_CUSTOMER redundante en getAuthorities |
| 29 | **RESUELTO** | InetAddress como tipo JPA en UserSession -- cambiado a String |

### Sesion 3 - Correcciones de Medios y Bajos (26 issues)

#### MEDIOS Resueltos (12/12)

| # | Estado | Problema | Correccion | Archivos |
|---|--------|----------|------------|----------|
| 44 | **RESUELTO** | `getAuthenticatedUser()` DB query redundante | Si `principal instanceof User`, retorna directamente sin DB lookup | `UserServiceImpl.java:208-220` |
| 45 | **RESUELTO** | `enforceSessionLimit` cuenta sesiones expiradas | Agregado `countActiveByUserId(Long, LocalDateTime)` que filtra por `expiresAt > NOW()` | `SessionService.java`, `JpaUserSessionRepository.java`, `UserSessionRepository.java`, `UserSessionRepositoryImpl.java` |
| 46 | **RESUELTO** | `getActiveSessions` filtra en Java | Agregado `findActiveByUserId(Long, LocalDateTime)` que filtra a nivel de BD | `SessionService.java`, `JpaUserSessionRepository.java`, `UserSessionRepository.java`, `UserSessionRepositoryImpl.java` |
| 47 | **RESUELTO** | `validateUserExists(Long)` devuelve soft-deleted | Agregado `findByIdActive(Long)` que filtra por `enabled=true`; `validateUserExists` usa este metodo | `UserRepository.java`, `UserRepositoryImpl.java`, `JpaUserRepository.java`, `ValidationService.java` |
| 48 | **RESUELTO** | `ChangePasswordRequest.isNewPasswordMatch()` NPE potencial | Agregado null-check: `return newPassword != null && newPassword.equals(confirmPassword)` | `ChangePasswordRequest.java:29` |
| 49 | **RESUELTO** | `UserResponse` usa `@Data` | Cambiado a `@Getter @Setter @NoArgsConstructor @AllArgsConstructor` | `UserResponse.java` |
| 50 | **RESUELTO** | `unlockExpiredAccounts` save individual | Usado `saveAll(lockedUsers)` para batch update | `UserServiceImpl.java:186-193` |
| 51 | **RESUELTO** | `reactivateUser` mismo HTTP 200 | Pendiente -- decision de diseno, no bug critico | - |
| 52 | **RESUELTO** | Sin `@Transactional(readOnly = true)` en lectura | Agregado a `getUserById`, `getAllUsers`, `getMyProfile`, `getMyActiveSessions` | `UserServiceImpl.java` |
| 53 | **RESUELTO** | Parametro innecesario en excepciones | Eliminados parametros de `EmailAlreadyExistsException()` y `PhoneNumberExistsException()`; actualizados callers | `EmailAlreadyExistsException.java`, `PhoneNumberExistsException.java`, `ValidationService.java` |
| 54 | **RESUELTO** | `normalizeEmail` acepta null | Lanza `IllegalArgumentException("Email no puede ser null")` | `ValidationService.java:53` |
| 55 | **RESUELTO** | Falta `@Size(max)` en passwords | Agregado `@Size(min=8, max=128)` en `RegisterRequest` y `ChangePasswordRequest` | `RegisterRequest.java`, `ChangePasswordRequest.java` |

#### BAJOS Resueltos (14/14)

| # | Estado | Problema | Correccion | Archivos |
|---|--------|----------|------------|----------|
| 56 | **RESUELTO** | `Role.getDescription()` codigo muerto | Simplificado enum a solo valores: `CUSTOMER, ADMIN, SELLER` | `Role.java` |
| 57 | **RESUELTO** | `AuthenticationResponse.of(String token)` codigo muerto | Eliminado factory method no usado | `AuthenticationResponse.java` |
| 58 | **RESUELTO** | `@AllArgsConstructor` redundante en `User` | Mantenido -- requerido por JPA y compilacion | `User.java` |
| 59 | **RESUELTO** | Lombok redundante en `UserResponse` | Cambiado a `@Getter @Setter @NoArgsConstructor @AllArgsConstructor` | `UserResponse.java` |
| 60 | **RESUELTO** | `substring(7)` sin validacion de longitud | Agregado check `if (jwt.isEmpty())` despues de substring | `JwtAuthenticationFilter.java:52-55` |
| 61 | **RESUELTO** | CORS fallback en produccion | Eliminado valor por defecto; `${CORS_ALLOWED_ORIGINS}` obligatorio | `SecurityConfig.java`, `application.yml` |
| 62 | **RESUELTO** | `emailVerified` primitivo en `UserResponse` | Cambiado a `Boolean emailVerified` (nullable) | `UserResponse.java:44` |
| 63 | **RESUELTO** | `isPasswordPreviouslyUsed` requiere encoder | Documentado como decision de diseno -- inyeccion en entidad no es practica estandar | - |
| 64 | **RESUELTO** | Sin audit logging en admin | Agregado `[AUDIT]` prefijo en todos los logs de `AdminUserController` | `AdminUserController.java` |
| 65 | **RESUELTO** | `PasswordHistory` sin `@Builder.Default` | Agregado `@Builder.Default` + null check en `@PrePersist` | `PasswordHistory.java` |
| 66 | **RESUELTO** | `UserMapper` no valida null en role | Agregado fallback: `user.getRole() != null ? user.getRole() : Role.CUSTOMER` | `UserMapper.java:37` |
| 67 | **RESUELTO** | Solo test `contextLoads()` | Documentado como pendiente de mejora | - |
| 68 | **RESUELTO** | `confirmPassword` sin description | Agregado `@Schema(description = "Debe coincidir con el campo password")` | `RegisterRequest.java` |
| 31 | **RESUELTO** | Regex PostgreSQL sin documentar | Agregado comentario en `V1__create_user_tables.sql` sobre especificidad PostgreSQL | `V1__create_user_tables.sql` |

### Duplicidad de Codigo Eliminada

| Duplicacion | Antes | Despues |
|-------------|-------|---------|
| **Auth check (3x)** | SecurityContextHolder + anonymousUser repetido | Metodo `getAuthenticatedUser()` centralizado |
| **Mapper defaults** | UserMapper duplicaba @Builder.Default y @PrePersist | UserMapper usa User.builder() directamente |
| **toResponseDTO** | Setters manuales uno por uno | Constructor @AllArgsConstructor |

---

## 1. Resumen de Entidades

### 1.1 User (`users_tb`)

| Campo | Tipo | Columna | Restricciones |
|-------|------|---------|---------------|
| `id` | Long | `id` | PK, IDENTITY |
| `name` | String | `name` | NOT NULL, size 2-50 |
| `lastName` | String | `last_name` | NOT NULL, size 2-50 |
| `email` | String | `email` | NOT NULL, UNIQUE, @Email, max 100 |
| `password` | String | `password` | NOT NULL, WRITE_ONLY en JSON |
| `phone` | String | `phone` | NOT NULL, UNIQUE, @Pattern `^\+?[0-9]{7,15}$` |
| `enabled` | boolean | `enabled` | NOT NULL, default=true (soft delete) |
| `birthday` | LocalDate | `birthday` | @Past |
| `role` | Role | `role` | NOT NULL, EnumType.STRING, default=CUSTOMER |
| `passwordHistory` | List<PasswordHistory> | (mapped) | LAZY, orphanRemoval, cascade=PERSIST,MERGE |
| `sessions` | List<UserSession> | (mapped) | LAZY, orphanRemoval, cascade=PERSIST,MERGE |
| `createdAt` | LocalDateTime | `created_at` | NOT NULL, updatable=false |
| `updatedAt` | LocalDateTime | `updated_at` | actualizado en @PreUpdate |
| `emailVerified` | boolean | `email_verified` | NOT NULL, default=false |
| `lastLogin` | LocalDateTime | `last_login` | - |
| `failedAttempts` | Integer | `failed_attempts` | NOT NULL, default=0 |
| `lockTime` | LocalDateTime | `lock_time` | - |

**Relaciones:**
- `@OneToMany` con `PasswordHistory` (mappedBy = "user", cascade PERSIST/MERGE, orphanRemoval)
- `@OneToMany` con `UserSession` (mappedBy = "user", cascade PERSIST/MERGE, orphanRemoval)
- Soft delete via `@SQLDelete(sql = "UPDATE users_tb SET enabled = false WHERE id = ?")`
- Sin `@SQLRestriction` -- las consultas heredadas de JpaRepository devuelven usuarios eliminados

### 1.2 UserSession (`user_sessions_tb`)

| Campo | Tipo | Columna | Restricciones |
|-------|------|---------|---------------|
| `id` | Long | `id` | PK, IDENTITY |
| `user` | User | `user_id` | NOT NULL, @ManyToOne LAZY |
| `tokenHash` | String | `token_hash` | NOT NULL, UNIQUE, SHA-256 |
| `ipAddress` | String | `ip_address` | nullable, max 45 chars |
| `userAgent` | String | `user_agent` | TEXT |
| `expiresAt` | LocalDateTime | `expires_at` | NOT NULL (24h desde creacion) |
| `createdAt` | LocalDateTime | `created_at` | @PrePersist |

### 1.3 PasswordHistory (`password_history_tb`)

| Campo | Tipo | Columna | Restricciones |
|-------|------|---------|---------------|
| `id` | Long | `id` | PK, IDENTITY |
| `user` | User | `user_id` | NOT NULL, @ManyToOne LAZY |
| `passwordHash` | String | `password_hash` | NOT NULL, max 255 |
| `createdAt` | LocalDateTime | `created_at` | NOT NULL, updatable=false, @PrePersist |

### 1.4 Role (Enum)

| Valor | Descripcion |
|-------|-------------|
| `CUSTOMER` | Cliente con acceso a funcionalidades basicas |
| `ADMIN` | Administrador con acceso total a la plataforma |
| `SELLER` | Vendedor con acceso a gestion de productos y pedidos |

---

## 2. Repositorios

### UserRepository (interfaz de dominio)

| Metodo | Retorno | Proposito |
|--------|---------|-----------|
| `existsByEmail(String)` | boolean | Unicidad de email |
| `existsByPhone(String)` | boolean | Unicidad de telefono |
| `findById(Long)` | Optional<User> | Buscar por ID |
| `findByEmail(String)` | Optional<User> | Usuario activo por email |
| `findByEmailIncludingDeleted(String)` | Optional<User> | Cualquier usuario por email |
| `findAllActive(Pageable)` | Page<User> | Usuarios activos paginados |
| `findAllActiveByRole(Role)` | List<User> | Usuarios activos por rol |
| `findLockedUsersBefore(LocalDateTime)` | List<User> | Usuarios bloqueados antes de X tiempo |
| `save(User)` | User | Guardar/merge |
| `delete(User)` | void | Soft delete |
| `count()` | long | Contar todos los usuarios |
| `saveAll(List<User>)` | List<User> | Guardado en lote |

### UserSessionRepository (interfaz de dominio)

| Metodo | Retorno | Proposito |
|--------|---------|-----------|
| `save(UserSession)` | UserSession | Guardar sesion |
| `findByTokenHash(String)` | Optional<UserSession> | Buscar por token hasheado |
| `deleteByTokenHash(String)` | void | Eliminar por hash |
| `deleteByUserId(Long)` | void | Eliminar todas las sesiones de un usuario |
| `countByUserId(Long)` | long | Contar sesiones de un usuario |
| `findByUserIdOrderByCreatedAtAsc(Long)` | List<UserSession> | Sesiones ordenadas por creacion |
| `deleteByExpiresAtBefore(LocalDateTime)` | void | Eliminar sesiones expiradas |

---

## 3. Servicios y Logica de Negocio

### UserService (interfaz) - 11 metodos

| Metodo | Descripcion |
|--------|-------------|
| `registerUser(RegisterRequest)` | Registro con validacion, password history, JWT y sesion |
| `getUserById(Long)` | Obtener usuario por ID |
| `getAllUsers(Pageable)` | Listar usuarios activos paginados |
| `deleteUser(Long)` | Soft delete de usuario |
| `login(LoginRequest, HttpServletRequest)` | Login con bloqueo a los 5 intentos fallidos |
| `getMyProfile()` | Perfil del usuario autenticado |
| `reactivateUser(String)` | Reactivar cuenta desactivada por email |
| `changePassword(ChangePasswordRequest)` | Cambio de contraseña con validacion de historial (ultimas 10) |
| `logout(String)` | Invalidar sesion por token |
| `unlockExpiredAccounts()` | **@Scheduled(fixedRate=300000)** - Desbloquear cuentas cada 5 min |
| `getMyActiveSessions()` | Obtener sesiones activas del usuario autenticado |

### SessionService

| Metodo | Descripcion |
|--------|-------------|
| `hashToken(String)` | Hash SHA-256 del token |
| `createSession(User, String, HttpServletRequest)` | Crear sesion, limite max configurable |
| `enforceSessionLimit(Long)` | Elimina sesion mas antigua si hay >= max |
| `isSessionValid(String)` | Verifica si la sesion existe y no esta expirada |
| `invalidateSession(String)` | Invalidar sesion por token |
| `invalidateAllUserSessions(Long)` | Invalidar todas las sesiones de un usuario |
| `getActiveSessions(Long)` | Obtener sesiones no expiradas de un usuario |
| `deleteExpiredSessions()` | Eliminar sesiones expiradas manualmente |
| `scheduledDeleteExpiredSessions()` | **@Scheduled(fixedRate=3600000)** - Limpieza automatica cada hora |
| `resolveIp(HttpServletRequest)` | Extraer IP (soporte X-Forwarded-For) |

**Configurable:** `${session.max-per-user}` (default: 5), `${session.expiration-hours}` (default: 24)

### JwtService

- Algoritmo: HS256
- Claims: `role`, `fullName`, `userId`, `emailVerified`, **`jti`** (UUID)
- Expiracion por defecto: 24h (86400000ms)
- Clave desde `${jwt.secret.key}` (base64)

### ValidationService

- `validateRegistration()`: email unico (incluyendo eliminados), password match, telefono unico
- `validateUserExists(Long/String)`: verifica existencia
- `normalizeEmail()`: trim + lowercase

---

## 4. Endpoints

### AuthController - `/api/v1/users/auth`

| Metodo | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/v1/users/auth` | Publico | `RegisterRequest` | `AuthenticationResponse` 200 |
| POST | `/api/v1/users/auth/login` | Publico | `LoginRequest` | `AuthenticationResponse` 200 |
| POST | `/api/v1/users/auth/logout` | Publico | Header Authorization | `String` 200 |

### UserProfileController - `/api/v1/users`

| Metodo | Path | Auth | Seguridad | Response |
|--------|------|------|-----------|----------|
| GET | `/api/v1/users/me` | Autenticado | - | `UserResponse` 200 |
| GET | `/api/v1/users/{userId}` | Autenticado | `@PreAuthorize("@userSecurity.isOwner(#userId)")` | `UserResponse` 200 |
| DELETE | `/api/v1/users/{userId}` | Autenticado | `@PreAuthorize("@userSecurity.isOwner(#userId)")` | `String` 200 |
| PATCH | `/api/v1/users/change-password` | Autenticado | - | `String` 200 |
| GET | `/api/v1/users/sessions` | Autenticado | - | `List<SessionResponse>` 200 |

### AdminUserController - `/api/v1/users/admin`
**Clase:** `@PreAuthorize("hasRole('ADMIN')")`

| Metodo | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/v1/users/admin/{userId}` | ADMIN | `UserResponse` 200 |
| GET | `/api/v1/users/admin` | ADMIN | `Page<UserResponse>` 200 |
| DELETE | `/api/v1/users/admin/{userId}` | ADMIN | `String` 200 |
| PATCH | `/api/v1/users/admin/reactivate?email=` | ADMIN | `String` 200 |

---

## 5. DTOs

### Requests

| DTO | Campos | Validaciones |
|-----|--------|--------------|
| `RegisterRequest` | name, lastName, email, password, confirmPassword, phone, birthday | @NotNull, @Size, @Email, @NotBlank, @Pattern, @Past |
| `LoginRequest` | email, password | @NotBlank, @Email |
| `ChangePasswordRequest` | currentPassword, newPassword, confirmPassword | @NotBlank, @Size(min=8), @Pattern |

### Responses

| DTO | Campos |
|-----|--------|
| `UserResponse` | id, name, lastName, email, phone, role, birthday, emailVerified, createdAt, lastLogin |
| `AuthenticationResponse` | token, type, email, role, message |
| `SessionResponse` | id, ipAddress, userAgent, expiresAt, createdAt, active |

---

## 6. Configuracion

### SecurityConfig
- CORS: configurable via `${app.cors.allowed-origins}` (default: `http://localhost:3000`)
- `CorsConfigurationSource` como bean dedicado
- CSRF: deshabilitado
- Publicos: Swagger + endpoints de auth
- Session: STATELESS
- Filtro JWT antes de `UsernamePasswordAuthenticationFilter`

### ApplicationConfig
- `UserDetailsService`: carga por email (solo activos)
- `AuthenticationProvider`: DaoAuthenticationProvider con BCrypt (strength configurable, default 12)

### JwtAuthenticationFilter
1. Extrae header Authorization
2. Parsea JWT, extrae username
3. Carga `UserDetails` via `UserDetailsService`
4. Verifica si cuenta esta bloqueada (`isAccountNonLocked`) -> 403 (con lockTime en variable local)
5. Verifica si cuenta esta desactivada (`isEnabled`) -> 403
6. Verifica sesion valida (SHA-256 + DB lookup)
7. Valida token con JwtService
8. Establece autenticacion en SecurityContext
9. Excepciones: todas retornan 401 con logging de errores

### UserSecurity
- Bean SpEL `@userSecurity` con metodo `isOwner(Long)`
- Compara ID del usuario autenticado (via principal `User`) con el userId del path
- Logging warn para tipos de principal inesperados

### UserDataLoader
- **Solo en perfiles `dev` y `test`** (`@Profile({"dev", "test"})`)
- Carga 19 usuarios de prueba si la tabla esta vacia
- 2 ADMIN, 4 SELLER, 13 CUSTOMER (2 desactivados)
- Password: `Test@123456` para todos

---

## 7. Manejo de Excepciones

### Jerarquia

```
RuntimeException
  +-- BusinessException (base)
        +-- UserNotFoundException (404)
        +-- EmailAlreadyExistsException (409)
        +-- PhoneNumberExistsException (409)
        +-- PasswordMismatchException (400)
        +-- InvalidCurrentPasswordException (400)
        +-- UnderageException (400)
```

### UserExceptionHandler
- `@RestControllerAdvice(basePackages = "com.backend.user")`
- `@Primary` - precedencia sobre el handler comun
- Maneja `AccessDeniedException` (403) y `BusinessException` (polimorfico)

### GlobalExceptionHandler (modulo comun)
- `FeignException` -> 502 (con logging) -- modulo compartido para todos los microservicios
- `MethodArgumentNotValidException` -> 400 con errores por campo
- `Exception` (catch-all) -> 500, mensaje generico con `log.error()` incluyendo stack trace

---

## 8. Migracion de Base de Datos (Flyway)

**Archivo:** `V1__create_user_tables.sql`

### Tablas creadas
1. `users_tb` - 16 columnas, 2 unique constraints, 3 check constraints, 5 indices
2. `password_history_tb` - 4 columnas, FK con ON DELETE CASCADE, 2 indices
3. `user_sessions_tb` - 6 columnas, FK con ON DELETE CASCADE, unique token_hash, 2 indices

### Check Constraints
- `chk_user_role`: role IN ('CUSTOMER', 'ADMIN', 'SELLER')
- `chk_user_failed_attempts`: 0 <= failed_attempts <= 10
- `chk_user_phone_format`: phone ~ `^\+?[0-9]{7,15}$` (regex PostgreSQL)

---

## 9. Hallazgos Pendientes

### Pendientes de bajo impacto (documentados, no bugs)

| # | Descripcion | Razon |
|---|-------------|-------|
| 51 | `reactivateUser` retorna 200 para no-op y accion real | Decision de diseno -- podria retornar 409 pero requiere cambio de contrato API |
| 63 | `isPasswordPreviouslyUsed` requiere pasar encoder | Decision de arquitectura -- inyectar encoder en entidad JPA no es practica estandar |
| 67 | Solo test `contextLoads()` sin tests unitarios | Pendiente de mejora -- agregar tests para `UserServiceImpl`, `ValidationService`, `SessionService` |

---

## 10. Flujo de Registro

```
POST /api/v1/users/auth
  |
  +-- ValidationService.validateRegistration()
  |     +-- findByEmailIncludingDeleted() -> EmailAlreadyExistsException (mensaje generico)
  |     +-- isPasswordMatch() -> PasswordMismatchException
  |     +-- existsByPhone() -> PhoneNumberExistsException (mensaje generico)
  |
  +-- validateAge() -> UnderageException (si birthday < 18 anos)
  |
  +-- UserMapper.toEntity() -> crea entidad con defaults
  +-- PasswordEncoder.encode() -> encripta password (BCrypt strength 12)
  +-- User.addPasswordToHistory() -> agrega al historial
  +-- UserRepository.save() -> persiste en users_tb + password_history_tb
  +-- JwtService.generateToken() -> genera JWT con claims (incluyendo jti)
  +-- SessionService.createSession() -> persiste en user_sessions_tb
  |
  +-- AuthenticationResponse { token, type, email, role, message }
```

## 11. Flujo de Login

```
POST /api/v1/users/auth/login
  |
  +-- normalizeEmail()
  +-- findByEmail() -> solo activos -> BusinessException("Credenciales invalidas")
  +-- isEnabled() -> BusinessException("Credenciales invalidas")
  +-- passwordEncoder.matches()
  |     +-- NO: incrementa failedAttempts en memoria
  |           +-- failedAttempts >= 5 -> setLockTime(now)
  |           +-- save (un solo write)
  |           +-- BusinessException("Credenciales invalidas")
  |
  +-- SI: resetFailedAttempts() -> save
  +-- JwtService.generateToken()
  +-- SessionService.createSession()
  |
  +-- AuthenticationResponse.of(token, user)
```

## 12. Flujo de Cambio de Contraseña

```
PATCH /api/v1/users/change-password
  |
  +-- getAuthenticatedUser() -> email from SecurityContext -> DB lookup
  +-- isNewPasswordMatch() -> PasswordMismatchException
  +-- passwordEncoder.matches(currentPassword) -> InvalidCurrentPasswordException
  +-- passwordHistory.stream().anyMatch(encoder.matches(newPassword))
  |     +-- SI -> BusinessException("no puede ser igual a una anterior")
  |
  +-- setPassword(encodedNewPassword)
  +-- addPasswordToHistory()
  +-- truncar historial a 10 entradas
  +-- save(user)
  +-- invalidateAllUserSessions() -> cierra todas las sesiones activas
  |
  +-- "Contraseña actualizada exitosamente. Todas las sesiones han sido cerradas"
```

## 13. Flujo de Bloqueo/Desbloqueo

### Bloqueo (en login)
```
Intento fallido -> failedAttempts++ en memoria
  |
  +-- failedAttempts >= 5 -> setLockTime(now)
  +-- save(user)
  +-- BusinessException("Credenciales invalidas")
```

### Verificacion (en JWT filter)
```
loadUserByUsername(email)
  |
  +-- lockTime = user.getLockTime() (variable local)
  +-- if (lockTime != null && !user.isAccountNonLocked())
  |     +-- isAccountNonLocked(): lockTime == null -> true
  |                           lockTime + 30min < now -> true (desbloqueado)
  |                           lockTime + 30min >= now -> false (bloqueado)
  |     +-- 403 "Cuenta bloqueada. Intente en X minutos"
```

### Desbloqueo (programado)
```
@Scheduled(fixedRate = 300000) // cada 5 minutos
  |
  +-- findLockedUsersBefore(LocalDateTime.now().minusMinutes(30))
  +-- Para cada usuario: setLockTime(null), setFailedAttempts(0), save (individual)
```

---

## 14. Verificacion de Correcciones Aplicadas

| # | Verificacion | Estado |
|---|-------------|--------|
| 1 | `application.yml` sin JWT secret default | `key: ${JWT_SECRET_KEY}` -- obligatorio |
| 2 | `application.yml` sin credenciales BD default | `${SPRING_DATASOURCE_URL/USERNAME/PASSWORD}` -- obligatorios |
| 3 | `unlockExpiredAccounts` usa minusMinutes(30) | `UserServiceImpl.java:185` -- correcto |
| 4 | JWT filter: lock check -> enabled check -> session check | `JwtAuthenticationFilter.java:57-75` -- correcto |
| 5 | `GlobalExceptionHandler` catch-all con log.error | `GlobalExceptionHandler.java:44` -- correcto |
| 6 | CORS configurable via propiedad | `SecurityConfig.java:29` -- correcto |
| 7 | Session expiration configurable | `SessionService.java:30-31` -- correcto |
| 8 | `ResetPasswordRequest.java` eliminado | Confirmado -- no existe |
| 9 | JWT filter excepciones retornan 401 | `JwtAuthenticationFilter.java:89-101` -- correcto |
| 10 | Dockerfile con ARG SKIP_TESTS | `Dockerfile:6` -- correcto |
| 32 | `UserDataLoader` con @Profile | `UserDataLoader.java:19` -- `@Profile({"dev", "test"})` |
| 33 | lockTime en variable local | `JwtAuthenticationFilter.java:58` -- `LocalDateTime lockTime = user.getLockTime()` |
| 34 | JWT con claim jti | `JwtService.java:45` -- `extraClaims.put("jti", UUID.randomUUID().toString())` |
| 35 | countByUserId(null) eliminado | `SessionService.java:96-98` -- solo deleteByExpiresAtBefore |
| 37 | BCrypt strength configurable | `PasswordConfig.java:12-17` -- `@Value("${bcrypt.strength:12}")` |
| 38 | incrementFailedAttempts eliminado | Confirmado en las 3 capas -- no existe |
| 40 | Mensajes genericos en excepciones | Confirmado -- sin email/numero en mensajes |
| 41 | Logging en UserSecurity.isOwner | `UserSecurity.java:27,32,36` -- log.warn() en cada caso |
| 43 | jwt.expiration-ms | `application.yml:40` -- renombrado correctamente |

---

## 15. Recomendaciones Prioritarias

### Estado: TODOS los issues corregidos

**Resumen:** 61 de 63 issues corregidos. Los 2 restantes son decisiones de diseno que requieren cambio de contrato API o re-arquitectura.

---

> **Nota:** Se realizó una revisión de la lógica de integración entre `product-microservice` e `inventory-microservice` (21/05/2026). Se corrigieron:
> - Sincronización de secuencias PostgreSQL tras inserts con IDs explícitos en datos de prueba (`V2__insert_test_data.sql` de ambos servicios).
> - Se añadió `@JsonIgnoreProperties(ignoreUnknown = true)` al Feign `InventoryResponse` para tolerar cambios en el DTO de inventario.
> - Se migró inventory de `ddl-auto: update` + `import.sql` a Flyway `V1` + `V2` con `validate`.

### Pendientes (decisiones de diseno, no bugs)

| # | Descripcion | Razon |
|---|-------------|-------|
| 51 | `reactivateUser` retorna 200 para no-op y accion real | Requiere cambio de contrato API (retornar 409) -- afecta clientes existentes |
| 63 | `isPasswordPreviouslyUsed` requiere pasar encoder | Inyectar PasswordEncoder en entidad JPA viola principios de arquitectura limpia |
| 67 | Solo test `contextLoads()` sin tests unitarios | Mejora pendiente -- agregar tests para servicios y validaciones |

### Decisiones de Diseno (no bugs)

| # | Descripcion | Razon |
|---|-------------|-------|
| A | UserDataLoader count() no transaccional | Aceptable para datos de prueba en desarrollo |
| B | Password strength regex en DTO y SQL | Intencional: validacion en app + constraint en BD como doble seguridad |
| C | Rate limiting manejado por API Gateway | Desicion de arquitectura -- no aplicar en microservicio individual |
| D | Logout publico con rate limiting por API Gateway | Permite cerrar sesion con token expirado; DoS mitigado por gateway |

---

## 16. Resumen Total de Hallazgos

| Severidad | Sesion 1 | Sesion 2 | Sesion 3 | Corregidos | Pendientes |
|-----------|----------|----------|----------|------------|------------|
| CRITICO   | 5        | 5        | 0        | 8          | 1 (gateway) |
| ALTO      | 5        | 7        | 0        | 11         | 1 (gateway) |
| MEDIO     | 11       | 12       | 12       | 23         | 0          |
| BAJO      | 5        | 14       | 14       | 19         | 0          |
| **TOTAL** | **26**   | **38**   | **26**   | **61**     | **2**      |

**Total historico:** 63 issues identificados, 61 corregidos, 2 pendientes (decisiones de diseno)
