package com.backend.user.infrastructure.repository;

import com.backend.user.domain.entity.UserSession;
import com.backend.user.domain.repository.UserSessionRepository;
import com.backend.user.infrastructure.repository.jpa.JpaUserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserSessionRepositoryImpl implements UserSessionRepository {

    private final JpaUserSessionRepository jpaRepository;

    @Override
    public UserSession save(UserSession session) {
        return jpaRepository.save(session);
    }

    @Override
    public Optional<UserSession> findByTokenHash(String tokenHash) {
        return jpaRepository.findByTokenHash(tokenHash);
    }

    @Override
    public void deleteByTokenHash(String tokenHash) {
        jpaRepository.deleteByTokenHash(tokenHash);
    }

    @Override
    public void deleteByUserId(Long userId) {
        jpaRepository.deleteByUserId(userId);
    }

    @Override
    public long countByUserId(Long userId) {
        return jpaRepository.countByUserId(userId);
    }

    @Override
    public List<UserSession> findByUserIdOrderByCreatedAtAsc(Long userId) {
        return jpaRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    @Override
    public void deleteByExpiresAtBefore(LocalDateTime dateTime) {
        jpaRepository.deleteByExpiresAtBefore(dateTime);
    }

    @Override
    public long countActiveByUserId(Long userId, LocalDateTime now) {
        return jpaRepository.countByUserIdAndExpiresAtAfter(userId, now);
    }

    @Override
    public List<UserSession> findActiveByUserId(Long userId, LocalDateTime now) {
        return jpaRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtAsc(userId, now);
    }
}
