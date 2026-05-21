package com.backend.user.infrastructure.controller;

import com.backend.user.application.dto.request.LoginRequest;
import com.backend.user.application.dto.request.RegisterRequest;
import com.backend.user.application.dto.response.AuthenticationResponse;
import com.backend.user.domain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Auth")
public class AuthController {

    private final UserService service;

    @Operation(summary = "Registrar un nuevo usuario",
               description = """
                       Crea un nuevo usuario en la base de datos con rol CUSTOMER por defecto.
                       Valida que el email y teléfono no estén registrados, que las contraseñas coincidan,
                       y que el usuario sea mayor de 18 años si se proporciona fecha de nacimiento.
                       Retorna un token JWT para iniciar sesión automáticamente.
                       """)
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario registrado con éxito. Se retorna token JWT."),
        @ApiResponse(responseCode = "400", description = "Datos de registro inválidos (contraseña débil, campos faltantes, email inválido, etc.)"),
        @ApiResponse(responseCode = "409", description = "Conflicto: el email o el teléfono ya están registrados")
    })
    @PostMapping
    public ResponseEntity<AuthenticationResponse> createUser(@RequestBody @Valid RegisterRequest request) {
        log.info("Petición de registro para email: {}", request.getEmail());
        return ResponseEntity.ok(service.registerUser(request));
    }

    @Operation(summary = "Iniciar sesión",
               description = """
                       Valida las credenciales del usuario (email + contraseña).
                       Si las credenciales son correctas, resetea los intentos fallidos,
                       crea una sesión activa y retorna un token JWT.
                       Si falla, incrementa el contador de intentos fallidos.
                       Tras 5 intentos fallidos, la cuenta se bloquea por 30 minutos.
                       """)
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa. Retorna token JWT + datos del usuario."),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas o cuenta bloqueada por intentos fallidos")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody @Valid LoginRequest request, HttpServletRequest httpRequest) {
        log.info("Intento de login para email: {}", request.email());
        return ResponseEntity.ok(service.login(request, httpRequest));
    }

    @Operation(summary = "Cerrar sesión",
               description = """
                       Invalida la sesión activa asociada al token JWT enviado en el header Authorization.
                       El endpoint es público para permitir cerrar sesión incluso si el token está expirado.
                       No requiere un token válido; si el token no existe o ya fue invalidado, la operación es un no-op.
                       NOTA: Rate limiting para este endpoint es manejado por el API Gateway.
                       """)
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sesión cerrada exitosamente (o no había sesión activa para ese token)"),
        @ApiResponse(responseCode = "400", description = "Token mal formado en el header Authorization")
    })
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }
        service.logout(token);
        return ResponseEntity.ok("Sesión cerrada exitosamente");
    }
}
