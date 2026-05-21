package com.backend.user.infrastructure.repository;

import com.backend.user.domain.entity.Role;
import com.backend.user.domain.entity.User;
import com.backend.user.domain.repository.UserRepository;
import com.backend.user.infrastructure.repository.jpa.JpaUserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final JpaUserRepository jpaRepository;

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return jpaRepository.existsByPhone(phone);
    }

    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<User> findByIdActive(Long id) {
        return jpaRepository.findByIdActive(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email); // ahora devuelve solo activos
    }

    @Override
    public Optional<User> findByEmailIncludingDeleted(String email) {
        return jpaRepository.findByEmailIncludingDeleted(email);
    }


    @Override
    public Page<User> findAllActive(Pageable pageable) {
        return jpaRepository.findAllActive(pageable); 
    }

    @Override
    public List<User> findAllActiveByRole(Role role) {
        return jpaRepository.findAllActiveByRole(role);
    }

    @Override
    public List<User> findLockedUsersBefore(LocalDateTime expirationTime) {
        return jpaRepository.findLockedUsersBefore(expirationTime);
    }

    @Override
    public User save(User user) {
        return jpaRepository.save(user);
    }

    @Override
    public void delete(User user) {
        jpaRepository.delete(user);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }
    
    @Override
    public List<User> saveAll(List<User> users) {
        return jpaRepository.saveAll(users);
    }
}