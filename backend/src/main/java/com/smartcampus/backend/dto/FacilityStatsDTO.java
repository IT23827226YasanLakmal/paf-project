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
public class FacilityStatsDTO {
    private long totalResources;
    private long lectureHalls;
    private long labs;
    private String healthScore;
    private List<Map<String, Object>> occupancy;
    private String interactionIncrease;
}
