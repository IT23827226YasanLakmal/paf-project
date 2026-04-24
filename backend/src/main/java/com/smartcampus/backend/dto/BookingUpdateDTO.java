package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO for PUT /api/bookings/{id}
 * Used to update an existing PENDING booking's details.
 * resourceId cannot be changed — only time, purpose, and attendees.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingUpdateDTO {

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 10, max = 500, message = "Purpose must be 10–500 characters")
    private String purpose;

    @Min(value = 1, message = "At least 1 attendee required")
    @Max(value = 1000, message = "Cannot exceed 1000 attendees")
    private Integer attendees;
}