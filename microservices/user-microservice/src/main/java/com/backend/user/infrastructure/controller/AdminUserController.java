package com.backend.user.infrastructure.controller;

import com.backend.user.application.dto.response.UserResponse;
import com.backend.user.domain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService service;

    @Operation(summary = "Obtener usuario por ID",
               description = "Retorna los datos de cualquier usuario activo. Solo accesible por administradores.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "403", description = "El usuario autenticado no tiene rol ADMIN"),
        @ApiResponse(responseCode = "404", description = "No se encontró un usuario activo con ese ID")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "ID del usuario a buscar", example = "1", required = true)
            @PathVariable Long userId) {
        log.info("[AUDIT] Admin solicita usuario con ID: {}", userId);
        return ResponseEntity.ok(service.getUserById(userId));
    }

    @Operation(summary = "Listar usuarios activos",
               description = """
                       Retorna una lista paginada de todos los usuarios activos (enabled = true).
                       Parámetros de paginación: ?page=0&size=20&sort=id,asc
                       """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Página de usuarios obtenida correctamente"),
        @ApiResponse(responseCode = "403", description = "El usuario autenticado no tiene rol ADMIN")
    })
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        log.info("[AUDIT] Admin lista usuarios activos con paginación");
        return ResponseEntity.ok(service.getAllUsers(pageable));
    }

    @Operation(summary = "Desactivar usuario (soft delete)",
               description = "Desactiva un usuario cambiando enabled = false. El usuario no podrá iniciar sesión. Puede ser reactivado posteriormente.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario desactivado correctamente"),
        @ApiResponse(responseCode = "403", description = "El usuario autenticado no tiene rol ADMIN"),
        @ApiResponse(responseCode = "404", description = "No se encontró un usuario activo con ese ID")
    })
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(
            @Parameter(description = "ID del usuario a desactivar", example = "1", required = true)
            @PathVariable Long userId) {
        log.info("[AUDIT] Admin desactiva usuario con ID: {}", userId);
        return ResponseEntity.ok(service.deleteUser(userId));
    }

    @Operation(summary = "Reactivar cuenta",
               description = "Reactiva una cuenta previamente desactivada (soft-delete). Busca por email incluyendo usuarios desactivados.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cuenta reactivada exitosamente, o mensaje indicando que ya estaba activa"),
        @ApiResponse(responseCode = "403", description = "El usuario autenticado no tiene rol ADMIN"),
        @ApiResponse(responseCode = "404", description = "No se encontró ningún usuario (activo o inactivo) con ese email")
    })
    @PatchMapping("/reactivate")
    public ResponseEntity<String> reactivate(
            @Parameter(description = "Email del usuario a reactivar", example = "juan.perez@example.com", required = true)
            @RequestParam String email) {
        log.info("[AUDIT] Admin reactiva cuenta con email: {}", email);
        return ResponseEntity.ok(service.reactivateUser(email));
    }
}
