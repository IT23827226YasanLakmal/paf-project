package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceDTO {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    private Integer capacity;
    private String location;
    private String availabilityWindows;
    
    @NotBlank(message = "Status is required")
    private String status;

    private String imageUrl;
}
