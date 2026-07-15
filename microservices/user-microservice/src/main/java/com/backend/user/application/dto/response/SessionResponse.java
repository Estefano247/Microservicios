package com.backend.user.application.dto.response;

import java.time.LocalDateTime;

public record SessionResponse(
    Long id,
    String ipAddress,
    String userAgent,
    LocalDateTime expiresAt,
    LocalDateTime createdAt,
    boolean active
) {
    public static SessionResponse of(Long id, String ipAddress, String userAgent,
                                     LocalDateTime expiresAt, LocalDateTime createdAt) {
        return new SessionResponse(id, ipAddress, userAgent, expiresAt, createdAt,
            expiresAt.isAfter(LocalDateTime.now()));
    }
}
