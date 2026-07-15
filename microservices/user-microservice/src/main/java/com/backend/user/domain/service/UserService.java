package com.backend.user.domain.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.backend.user.application.dto.request.ChangePasswordRequest;
import com.backend.user.application.dto.request.LoginRequest;
import com.backend.user.application.dto.request.RegisterRequest;
import com.backend.user.application.dto.response.AuthenticationResponse;
import com.backend.user.application.dto.response.SessionResponse;
import com.backend.user.application.dto.response.UserResponse;

import jakarta.servlet.http.HttpServletRequest;

public interface UserService {

    AuthenticationResponse registerUser(RegisterRequest request);
    UserResponse getUserById(Long userId);
    Page<UserResponse> getAllUsers(Pageable pageable);
    String deleteUser(Long userId);
    AuthenticationResponse login(LoginRequest loginRequest, HttpServletRequest httpRequest);
    UserResponse getMyProfile();
    String reactivateUser(String email);
    String changePassword(ChangePasswordRequest request);
    void logout(String token);
    void unlockExpiredAccounts();
    List<SessionResponse> getMyActiveSessions();
}