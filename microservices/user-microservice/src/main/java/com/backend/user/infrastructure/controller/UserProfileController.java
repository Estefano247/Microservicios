package com.backend.user.infrastructure.controller;

import com.backend.user.application.dto.request.ChangePasswordRequest;
import com.backend.user.application.dto.response.SessionResponse;
import com.backend.user.application.dto.response.UserResponse;
import com.backend.user.domain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Profile")
public class UserProfileController {

    private final UserService service;

    @Operation(summary = "Obtener mi perfil",
               description = "Retorna los datos del usuario actualmente autenticado mediante el token JWT.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil del usuario obtenido correctamente"),
        @ApiResponse(responseCode = "401", description = "Token JWT no proporcionado, inválido o expirado")
    })
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        log.debug("Obteniendo perfil del usuario autenticado");
        return ResponseEntity.ok(service.getMyProfile());
    }

    @Operation(summary = "Obtener datos propios por ID",
               description = "Retorna los datos del usuario por ID, pero solo si el usuario autenticado es el propietario de esa cuenta.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Datos del usuario encontrados"),
        @ApiResponse(responseCode = "403", description = "El ID solicitado no pertenece al usuario autenticado"),
        @ApiResponse(responseCode = "404", description = "No se encontró un usuario con ese ID")
    })
    @GetMapping("/{userId}")
    @PreAuthorize("@userSecurity.isOwner(#userId)")
    public ResponseEntity<UserResponse> getMyUserById(
            @Parameter(description = "ID del usuario (debe coincidir con el del token)", example = "1", required = true)
            @PathVariable Long userId) {
        log.debug("Usuario autenticado solicitando sus propios datos con ID: {}", userId);
        return ResponseEntity.ok(service.getUserById(userId));
    }

    @Operation(summary = "Desactivar mi cuenta",
               description = "Realiza un soft-delete de la cuenta del usuario autenticado (enabled = false). Solo el propietario puede hacerlo. La cuenta puede ser reactivada por un administrador.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cuenta desactivada correctamente"),
        @ApiResponse(responseCode = "403", description = "El ID solicitado no pertenece al usuario autenticado"),
        @ApiResponse(responseCode = "404", description = "No se encontró un usuario con ese ID")
    })
    @DeleteMapping("/{userId}")
    @PreAuthorize("@userSecurity.isOwner(#userId)")
    public ResponseEntity<String> deleteMyAccount(
            @Parameter(description = "ID de la cuenta a desactivar (debe coincidir con la del token)", example = "1", required = true)
            @PathVariable Long userId) {
        log.info("Usuario autenticado desactivando su cuenta con ID: {}", userId);
        return ResponseEntity.ok(service.deleteUser(userId));
    }

    @Operation(summary = "Cambiar contraseña",
               description = """
                       Permite al usuario autenticado cambiar su contraseña.
                       Valida que la contraseña actual sea correcta, que la nueva cumpla los requisitos de fortaleza,
                       que coincida con la confirmación, y que no haya sido usada en las últimas 10 contraseñas.
                       """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contraseña actualizada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos: contraseña actual incorrecta, nueva contraseña débil, no coinciden, o ya fue usada anteriormente")
    })
    @PatchMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        log.info("Usuario autenticado cambiando su contraseña");
        return ResponseEntity.ok(service.changePassword(request));
    }

    @Operation(summary = "Obtener sesiones activas",
               description = "Retorna todas las sesiones activas del usuario autenticado con información de IP, user agent y expiración.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de sesiones activas obtenida correctamente"),
        @ApiResponse(responseCode = "401", description = "Token JWT no proporcionado, inválido o expirado")
    })
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getActiveSessions() {
        log.debug("Obteniendo sesiones activas del usuario autenticado");
        return ResponseEntity.ok(service.getMyActiveSessions());
    }
}