package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Resources", description = "Facilities and asset catalogue management")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Operation(summary = "Get all resources, optionally filtered by type")
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(resourceService.getAllResources(type));
    }

    @Operation(summary = "Get a single resource by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @Operation(summary = "Create a new resource (admin)")
    @PostMapping
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        return new ResponseEntity<>(resourceService.createResource(resourceDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update a resource (admin)")
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceDTO resourceDTO) {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDTO));
    }

    @Operation(summary = "Delete a resource (admin)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Upload an image for a resource")
    @PostMapping("/{id}/image")
    public ResponseEntity<ResourceDTO> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get("uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Update resource with static URL
        String imageUrl = "/uploads/" + filename;
        return ResponseEntity.ok(resourceService.updateResourceImage(id, imageUrl));
    }
}
