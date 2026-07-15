package com.backend.user.domain.repository;

import com.backend.user.domain.entity.UserSession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSessionRepository {
    UserSession save(UserSession session);
    Optional<UserSession> findByTokenHash(String tokenHash);
    void deleteByTokenHash(String tokenHash);
    void deleteByUserId(Long userId);
    long countByUserId(Long userId);
    List<UserSession> findByUserIdOrderByCreatedAtAsc(Long userId);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    long countActiveByUserId(Long userId, LocalDateTime now);
    List<UserSession> findActiveByUserId(Long userId, LocalDateTime now);
}
