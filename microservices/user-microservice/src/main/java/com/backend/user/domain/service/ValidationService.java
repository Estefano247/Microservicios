package com.backend.user.domain.service;

import org.springframework.stereotype.Service;
import com.backend.user.application.dto.request.RegisterRequest;
import com.backend.user.domain.entity.User;
import com.backend.user.domain.repository.UserRepository;
import com.backend.user.infrastructure.exception.EmailAlreadyExistsException;
import com.backend.user.infrastructure.exception.PasswordMismatchException;
import com.backend.user.infrastructure.exception.PhoneNumberExistsException;
import com.backend.user.infrastructure.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ValidationService {

    private final UserRepository userRepository;

    public void validateRegistration(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        
        if (userRepository.findByEmailIncludingDeleted(normalizedEmail).isPresent()) {
            throw new EmailAlreadyExistsException();
        }

        if (!request.isPasswordMatch()) {
            throw new PasswordMismatchException();
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new PhoneNumberExistsException();
        }
    }

    public User validateUserExists(Long userId) {
        return userRepository.findByIdActive(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con ID: " + userId));
    }

    public User validateUserExists(String email) {
        String normalizedEmail = normalizeEmail(email);
        return userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con email: " + email));
    }
    
    public String normalizeEmail(String email) {
        if (email == null) throw new IllegalArgumentException("Email no puede ser null");
        return email.trim().toLowerCase();
    }
}