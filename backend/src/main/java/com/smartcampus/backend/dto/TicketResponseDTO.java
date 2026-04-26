package com.smartcampus.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private String category;
    private String description;
    private String priority;
    private String status;
    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
    private String rejectionReason;
    private String assignedToId;
    private String assignedToName;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
