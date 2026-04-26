package com.smartcampus.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 1000)
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    private String userId; // Set by controller or context

    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
}
