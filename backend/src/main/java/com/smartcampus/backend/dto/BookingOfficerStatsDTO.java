package com.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingOfficerStatsDTO {
    private long totalRequests;
    private long approvedRequests;
    private long pendingRequests;
    private long cancelledRejectedRequests;
    private List<Map<String, Object>> trend;
    private List<Map<String, Object>> topResources;
    private List<Map<String, Object>> peakDays;
}
