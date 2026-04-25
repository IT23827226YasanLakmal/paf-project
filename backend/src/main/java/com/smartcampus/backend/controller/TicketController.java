package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.TicketRequestDTO;
import com.smartcampus.backend.dto.TicketResponseDTO;
import com.smartcampus.backend.dto.CommentResponseDTO;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Incident ticket workflow, comments, and technician assignment")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        
        // If frontend didn't set userId in body, take it from header
        if (request.getUserId() == null) {
            request.setUserId(headerUserId);
        }
        
        return new ResponseEntity<>(ticketService.createTicket(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long resourceId) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> updates,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String newStatus = updates.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, newStatus, userId));
    }

    @Operation(summary = "Delete a ticket and its comments")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Assign a ticket to a technician (sets status to IN_PROGRESS)")
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String technicianId = body.get("technicianId");
        if (technicianId == null || technicianId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ticketService.assignTicket(id, technicianId));
    }

    @Operation(summary = "Add a comment to a ticket")
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketComment comment) {
        return new ResponseEntity<>(ticketService.addComment(id, comment), HttpStatus.CREATED);
    }

    @Operation(summary = "Get all comments for a ticket")
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicketId(id));
    }

    @Operation(summary = "Edit a comment (owner only)")
    @PatchMapping("/comments/{id}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id") String userId) {
        String newText = body.get("text");
        if (newText == null || newText.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ticketService.updateComment(id, newText, userId));
    }

    @Operation(summary = "Delete a comment (owner only)")
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        ticketService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
