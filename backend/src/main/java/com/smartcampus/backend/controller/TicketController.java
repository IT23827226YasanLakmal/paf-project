package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.TicketRequestDTO;
import com.smartcampus.backend.dto.TicketResponseDTO;
import com.smartcampus.backend.dto.CommentResponseDTO;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.service.TicketService;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long id, 
            @Valid @RequestBody TicketComment comment) {
        return new ResponseEntity<>(ticketService.addComment(id, comment), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicketId(id));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        ticketService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
