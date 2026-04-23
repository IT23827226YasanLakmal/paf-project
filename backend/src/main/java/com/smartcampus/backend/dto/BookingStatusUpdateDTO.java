package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingStatusUpdateDTO {
    @NotNull(message = "Status is required")
    private BookingStatus status;

    @Size(max = 500)
    private String rejectionReason; // Required when REJECTED
    @Size(max = 500)
    private String adminNote;
}
