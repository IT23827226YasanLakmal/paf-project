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
import com.smartcampus.backend.dto.TicketRequestDTO;
import com.smartcampus.backend.dto.TicketResponseDTO;
import com.smartcampus.backend.service.TicketService;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import com.smartcampus.backend.dto.CommentResponseDTO;
import com.smartcampus.backend.model.TicketComment;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Resources", description = "Facilities and asset catalogue management")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private TicketService ticketService;

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

    @GetMapping("/tickets/test")
    public ResponseEntity<String> testTickets() {
        return ResponseEntity.ok("Ticket endpoint is ACTIVE");
    }

    @Operation(summary = "Create a new ticket (maintenance)")
    @PostMapping("/tickets")
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        System.out.println("[ResourceController] Received ticket request for resource: " + request.getResourceId());
        if (request.getUserId() == null) request.setUserId(headerUserId);
        return new ResponseEntity<>(ticketService.createTicket(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Upload ticket images")
    @PostMapping("/tickets/{id}/images")
    public ResponseEntity<TicketResponseDTO> uploadTicketImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) throws IOException {
        
        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        List<String> imageUrls = new ArrayList<>();
        int count = Math.min(files.size(), 3);
        for (int i = 0; i < count; i++) {
            MultipartFile file = files.get(i);
            if (file.isEmpty()) continue;
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            imageUrls.add("/uploads/" + filename);
        }
        return ResponseEntity.ok(ticketService.updateTicketImages(id, imageUrls));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponseDTO>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, resourceId, userId));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/tickets/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id, 
            @RequestBody TicketRequestDTO request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        // If the request only has status, use updateTicketStatus for backward compatibility
        // But the service now has a more general update method too.
        // Let's check if it's a status-only update from a technician
        
        // For simplicity, if we have a description or priority, we use the general update
        if (request.getDescription() != null || request.getPriority() != null || request.getCategory() != null) {
            return ResponseEntity.ok(ticketService.updateTicket(id, request, userId));
        }
        
        // Default to status update if provided
        // We'll need a way to get the status from the DTO if it's not in the 'updates' map pattern
        // (Actually the frontend sends {status: '...'} in a PUT)
        // I'll adjust the DTO to include status if not already there, or just check the raw body
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request.getStatus(), userId));
    }

    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/tickets/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String technicianId = body.get("technicianId");
        if (technicianId == null || technicianId.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(ticketService.assignTicket(id, technicianId));
    }

    @PostMapping("/tickets/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketComment comment) {
        return new ResponseEntity<>(ticketService.addComment(id, comment), HttpStatus.CREATED);
    }

    @GetMapping("/tickets/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicketId(id));
    }

    @PatchMapping("/tickets/comments/{id}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id") String userId) {
        String newText = body.get("text");
        if (newText == null || newText.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(ticketService.updateComment(id, newText, userId));
    }

    @DeleteMapping("/tickets/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        ticketService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
