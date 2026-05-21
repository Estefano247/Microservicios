package com.backend.user.domain.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.user.application.dto.request.ChangePasswordRequest;
import com.backend.user.application.dto.request.LoginRequest;
import com.backend.user.application.dto.request.RegisterRequest;
import com.backend.user.application.dto.response.AuthenticationResponse;
import com.backend.user.application.dto.response.SessionResponse;
import com.backend.user.application.dto.response.UserResponse;
import com.backend.user.application.mapper.UserMapper;
import com.backend.user.domain.entity.User;
import com.backend.user.domain.repository.UserRepository;
import com.backend.user.domain.service.JwtService;
import com.backend.user.domain.service.SessionService;
import com.backend.user.domain.service.UserService;
import com.backend.user.domain.service.ValidationService;
import com.backend.user.infrastructure.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ValidationService validationService;
    private final UserMapper mapper;
    private final SessionService sessionService;

    @Override
    @Transactional
    public AuthenticationResponse registerUser(RegisterRequest request) {
        validationService.validateRegistration(request);
        validateAge(request.getBirthday());
        User user = createUserFromRegister(request);
        User savedUser = repository.save(user);
        String token = jwtService.generateToken(savedUser);
        sessionService.createSession(savedUser, token, null);
        return AuthenticationResponse.builder()
                .token(token)
                .type("Bearer")
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .message("Usuario registrado exitosamente")
                .build();
    }

    private void validateAge(LocalDate birthday) {
        if (birthday == null) return;
        if (Period.between(birthday, LocalDate.now()).getYears() < 18) {
            throw new UnderageException();
        }
    }

    private User createUserFromRegister(RegisterRequest request) {
        User user = mapper.toEntity(request);
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(encodedPassword);
        user.addPasswordToHistory(encodedPassword);
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = validationService.validateUserExists(userId);
        return mapper.toResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = repository.findAllActive(pageable);
        return userPage.map(mapper::toResponseDTO);
    }

    @Override
    @Transactional
    public String deleteUser(Long userId) {
        User user = validationService.validateUserExists(userId);
        repository.delete(user);
        return "Usuario con ID " + userId + " desactivado correctamente";
    }

    @Override
    @Transactional
    public AuthenticationResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String normalizedEmail = validationService.normalizeEmail(request.email());

        User user = repository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException("Credenciales inválidas"));

        if (!user.isEnabled()) {
            throw new BusinessException("Credenciales inválidas");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 5) {
                user.setLockTime(LocalDateTime.now());
            }
            repository.save(user);
            throw new BusinessException("Credenciales inválidas");
        }

        user.resetFailedAttempts();
        repository.save(user);

        String token = jwtService.generateToken(user);
        sessionService.createSession(user, token, httpRequest);
        return AuthenticationResponse.of(token, user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile() {
        User user = getAuthenticatedUser();
        return mapper.toResponseDTO(user);
    }

    @Override
    @Transactional
    public String reactivateUser(String email) {
        String normalizedEmail = validationService.normalizeEmail(email);
        User user = repository.findByEmailIncludingDeleted(normalizedEmail)
                .orElseThrow(() -> new UserNotFoundException("No se encontró registro con ese email"));

        if (user.isEnabled()) {
            return "La cuenta ya se encuentra activa";
        }

        user.setEnabled(true);
        user.setFailedAttempts(0);
        user.setLockTime(null);
        repository.save(user);
        return "Cuenta reactivada exitosamente para: " + email;
    }

    @Override
    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();

        if (!request.isNewPasswordMatch()) {
            throw new PasswordMismatchException();
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new InvalidCurrentPasswordException();
        }

        String encodedNewPassword = passwordEncoder.encode(request.newPassword());
        if (user.isPasswordPreviouslyUsed(request.newPassword(), passwordEncoder)) {
            throw new BusinessException("La nueva contraseña no puede ser igual a una anterior");
        }

        user.setPassword(encodedNewPassword);
        user.addPasswordToHistory(encodedNewPassword);
        user.truncatePasswordHistory(10);
        repository.save(user);
        sessionService.invalidateAllUserSessions(user.getId());
        return "Contraseña actualizada exitosamente. Todas las sesiones han sido cerradas";
    }

    @Override
    public void logout(String token) {
        if (token != null && !token.isEmpty()) {
            sessionService.invalidateSession(token);
        }
    }

    @Override
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void unlockExpiredAccounts(){
        List<User> lockedUsers = repository.findLockedUsersBefore(LocalDateTime.now().minusMinutes(30));
        lockedUsers.forEach(user -> {
            user.setLockTime(null);
            user.setFailedAttempts(0);
        });
        repository.saveAll(lockedUsers);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getMyActiveSessions() {
        User user = getAuthenticatedUser();

        return sessionService.getActiveSessions(user.getId()).stream()
                .map(s -> SessionResponse.of(
                    s.getId(),
                    s.getIpAddress(),
                    s.getUserAgent(),
                    s.getExpiresAt(),
                    s.getCreatedAt()
                ))
                .toList();
    }

    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BusinessException("No se encontró una sesión válida. Asegúrate de enviar el token Bearer.");
        }

        if (auth.getPrincipal() instanceof User user) {
            return user;
        }

        String email = auth.getName();
        return repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("El usuario del token no existe en la base de datos"));
    }
}