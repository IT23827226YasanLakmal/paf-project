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
public class TechnicianStatsDTO {
    private long totalTickets;
    private long activeTickets;
    private long resolvedTickets;
    private long urgentTickets;
    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> priorityDistribution;
    private List<DailyTrendDTO> trend;
}
