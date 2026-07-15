package com.backend.user.domain.service;

import com.backend.user.domain.entity.User;
import com.backend.user.domain.entity.UserSession;
import com.backend.user.domain.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final UserSessionRepository sessionRepository;

    @Value("${session.max-per-user:5}")
    private int maxSessionsPerUser;

    @Value("${session.expiration-hours:24}")
    private int sessionExpirationHours;

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al hashear el token", e);
        }
    }

    @Transactional
    public UserSession createSession(User user, String rawToken, HttpServletRequest request) {
        enforceSessionLimit(user.getId());
        String tokenHash = hashToken(rawToken);

        UserSession session = UserSession.builder()
                .user(user)
                .tokenHash(tokenHash)
                .ipAddress(resolveIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .expiresAt(LocalDateTime.now().plusHours(sessionExpirationHours))
                .build();

        return sessionRepository.save(session);
    }

    private void enforceSessionLimit(Long userId) {
        long activeSessions = sessionRepository.countActiveByUserId(userId, LocalDateTime.now());
        if (activeSessions >= maxSessionsPerUser) {
            List<UserSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtAsc(userId);
            if (!sessions.isEmpty()) {
                sessionRepository.deleteByTokenHash(sessions.get(0).getTokenHash());
            }
        }
    }

    @Transactional(readOnly = true)
    public boolean isSessionValid(String rawToken) {
        String tokenHash = hashToken(rawToken);
        return sessionRepository.findByTokenHash(tokenHash)
                .map(session -> session.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @Transactional
    public void invalidateSession(String rawToken) {
        String tokenHash = hashToken(rawToken);
        sessionRepository.deleteByTokenHash(tokenHash);
    }

    @Transactional
    public void invalidateAllUserSessions(Long userId) {
        sessionRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<UserSession> getActiveSessions(Long userId) {
        return sessionRepository.findActiveByUserId(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteExpiredSessions() {
        sessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.debug("Limpieza de sesiones expiradas completada");
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void scheduledDeleteExpiredSessions() {
        sessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.debug("Limpieza programada de sesiones expiradas ejecutada");
    }

    private String resolveIp(HttpServletRequest request) {
        if (request == null) return null;
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
