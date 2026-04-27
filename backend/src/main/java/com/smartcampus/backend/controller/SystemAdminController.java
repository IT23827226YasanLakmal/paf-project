package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.AdminStatsDTO;
import com.smartcampus.backend.service.SystemAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "System Admin", description = "System-wide administrative operations")
@RequiredArgsConstructor
public class SystemAdminController {

    private final SystemAdminService adminService;

    @Operation(summary = "Get system-wide statistics")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsDTO> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }
}
