package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.IncidentTicket;
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
    public ResponseEntity<IncidentTicket> createTicket(@Valid @RequestBody IncidentTicket ticket) {
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long resourceId) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentTicket> updateTicketStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> updates) {
        String newStatus = updates.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long id, 
            @Valid @RequestBody TicketComment comment) {
        return new ResponseEntity<>(ticketService.addComment(id, comment), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicketId(id));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        ticketService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
