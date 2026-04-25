package com.smartcampus.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // The person who performed the action

    @Column(nullable = false)
    private String action; // e.g., "ROLE_UPDATE", "BOOKING_APPROVED"

    @Column(name = "resource_type")
    private String resourceType; // e.g., "USER", "BOOKING", "RESOURCE"

    @Column(name = "resource_id")
    private String resourceId; // ID of the object being acted upon

    @Column(columnDefinition = "TEXT")
    private String details; // JSON or descriptive string of what changed

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
