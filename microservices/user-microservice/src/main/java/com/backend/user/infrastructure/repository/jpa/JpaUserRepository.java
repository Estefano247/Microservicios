package com.backend.user.infrastructure.repository.jpa;

import com.backend.user.domain.entity.Role;
import com.backend.user.domain.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface JpaUserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    // FIX: ahora solo busca usuarios activos (enabled = true)
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.enabled = true")
    Optional<User> findByEmail(@Param("email") String email);

    // FIX: búsqueda sin importar enabled, usando una consulta nativa para evitar filtros
    @Query(value = "SELECT * FROM users_tb WHERE email = :email", nativeQuery = true)
    Optional<User> findByEmailIncludingDeleted(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.enabled = true")
    Optional<User> findByIdActive(@Param("id") Long id);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.enabled = true")
    List<User> findAllActiveByRole(@Param("role") Role role);

    @Query("SELECT u FROM User u WHERE u.lockTime IS NOT NULL AND u.lockTime < :expirationTime")
    List<User> findLockedUsersBefore(@Param("expirationTime") LocalDateTime expirationTime);

    @Query("SELECT u FROM User u WHERE u.enabled = true")
    Page<User> findAllActive(Pageable pageable);
}