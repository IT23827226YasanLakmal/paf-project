package com.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTrendDTO {
    private String date; // e.g., "Mon", "2023-10-01"
    private long open;
    private long solved;
}
