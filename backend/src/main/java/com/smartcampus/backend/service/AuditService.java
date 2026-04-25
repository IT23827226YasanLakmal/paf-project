package com.smartcampus.backend.service;

import com.smartcampus.backend.model.AuditLog;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.AuditLogRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Records an audit entry. Uses REQUIRES_NEW propagation to ensure the log 
     * is saved even if the parent transaction fails (useful for tracking failed attempts).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String userId, String action, String resourceType, String resourceId, String details) {
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }

            AuditLog logEntry = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .details(details)
                    .build();

            auditLogRepository.save(logEntry);
            log.info("Audit Log Created: {} by user {}", action, userId);
        } catch (Exception e) {
            log.error("Failed to create audit log entry", e);
        }
    }
}
