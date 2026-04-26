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
public class AdminStatsDTO {
    private long totalBookings;
    private long pendingBookings;
    private long activeResources;
    private long openTickets;
    private long totalUsers;
    private List<Map<String, Object>> bookingFlow;
}
