package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Support for pagination — essential for high-volume audit logs
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<AuditLog> findByUser_SupabaseUid(String userId);
    
    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, String resourceId);
}
