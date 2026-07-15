package com.backend.user.application.mapper;

import com.backend.user.application.dto.request.RegisterRequest;
import com.backend.user.application.dto.response.UserResponse;
import com.backend.user.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }
        
        return User.builder()
                .name(request.getName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .birthday(request.getBirthday())
                .build();
    }

    public UserResponse toResponseDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() != null ? user.getRole() : com.backend.user.domain.entity.Role.CUSTOMER,
                user.getBirthday(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getLastLogin(),
                user.isEnabled()
        );
    }
}
