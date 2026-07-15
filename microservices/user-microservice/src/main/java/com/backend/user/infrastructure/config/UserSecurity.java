package com.backend.user.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component("userSecurity")
public class UserSecurity {

    private static final Logger log = LoggerFactory.getLogger(UserSecurity.class);

    public boolean isOwner(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof com.backend.user.domain.entity.User user) {
            return user.getId().equals(userId);
        }

        if (principal instanceof UserDetails userDetails) {
            log.warn("Principal inesperado en isOwner: tipo=UserDetails, email={}", userDetails.getUsername());
            return false;
        }

        if (principal instanceof String email) {
            log.warn("Principal inesperado en isOwner: tipo=String, email={}", email);
            return false;
        }

        log.warn("Principal inesperado en isOwner: tipo={}", principal.getClass().getName());
        return false;
    }
}