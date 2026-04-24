package com.smartcampus.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_resource", columnList = "resource_id"),
        @Index(name = "idx_booking_user", columnList = "user_id"),
        @Index(name = "idx_booking_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_id", nullable = false)
    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @Column(name = "user_id", nullable = false)
    @NotNull(message = "User ID is required")
    private Long userId;

    @Column(name = "start_time", nullable = false)
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "Purpose is required")
    @Size(min = 10, max = 500, message = "Purpose must be 10–500 characters")
    private String purpose;

    @Column
    @Min(value = 1, message = "At least 1 attendee required")
    @Max(value = 1000, message = "Cannot exceed 1000 attendees")
    private Integer attendees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    // UUID token generated when booking is APPROVED — used for QR check-in
    @Column(name = "qr_code_token", unique = true, length = 64)
    private String qrCodeToken;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
