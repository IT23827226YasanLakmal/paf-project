package com.smartcampus.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDTO {
    private Long id;
    private String text;
    private String userId;
    private String userName;
    private String userRole;
    private LocalDateTime createdAt;
}
