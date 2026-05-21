package com.backend.user.infrastructure.repository.jpa;

import com.backend.user.domain.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface JpaUserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findByTokenHash(String tokenHash);

    void deleteByTokenHash(String tokenHash);

    void deleteByUserId(Long userId);

    long countByUserId(Long userId);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);

    List<UserSession> findByUserIdOrderByCreatedAtAsc(Long userId);

    long countByUserIdAndExpiresAtAfter(Long userId, LocalDateTime expiresAt);

    List<UserSession> findByUserIdAndExpiresAtAfterOrderByCreatedAtAsc(Long userId, LocalDateTime expiresAt);
}
