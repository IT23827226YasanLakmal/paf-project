package com.smartcampus.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // LECTURE_HALL, LAB, EQUIPMENT

    private Integer capacity; // Can be null for equipment

    private String location;

    private String availabilityWindows; // e.g., "08:00-17:00"

    @Column(nullable = false)
    private String status; // ACTIVE, OUT_OF_SERVICE

    private String imageUrl;
}
