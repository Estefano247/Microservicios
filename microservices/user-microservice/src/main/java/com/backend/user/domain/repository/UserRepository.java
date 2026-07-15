package com.backend.user.domain.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.backend.user.domain.entity.Role;
import com.backend.user.domain.entity.User;

public interface UserRepository {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findById(Long id);
    Optional<User> findByIdActive(Long id);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIncludingDeleted(String email);
    Page<User> findAllActive(Pageable pageable);
    List<User> findAllActiveByRole(Role role);
    List<User> findLockedUsersBefore(LocalDateTime expirationTime);
    User save(User user);
    void delete(User user);
    long count();
    List<User> saveAll(List<User> users);
}