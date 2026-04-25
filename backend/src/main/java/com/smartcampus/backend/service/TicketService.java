package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.TicketRequestDTO;
import com.smartcampus.backend.dto.TicketResponseDTO;
import com.smartcampus.backend.dto.CommentResponseDTO;
import com.smartcampus.backend.model.IncidentTicket;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO req) {
        Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        IncidentTicket ticket = new IncidentTicket();
        ticket.setResource(resource);
        ticket.setUser(user);
        ticket.setCategory(req.getCategory());
        ticket.setDescription(req.getDescription());
        ticket.setPriority(req.getPriority());
        ticket.setImageUrl(req.getImageUrl());
        ticket.setStatus("OPEN");

        return toDTO(ticketRepository.save(ticket));
    }

    public List<TicketResponseDTO> getAllTickets(String status, Long resourceId) {
        List<IncidentTicket> tickets;
        if (status != null && !status.isEmpty()) {
            tickets = ticketRepository.findByStatus(status);
        } else if (resourceId != null) {
            tickets = ticketRepository.findByResource_Id(resourceId);
        } else {
            tickets = ticketRepository.findAll();
        }
        return tickets.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(Long id) {
        return toDTO(ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id)));
    }

    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, String status, String userId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (ticket.getFirstResponseAt() == null && !"OPEN".equals(status)) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        if ("RESOLVED".equals(status)) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (ticket.getResolvedAt() != null && ("OPEN".equals(status) || "IN_PROGRESS".equals(status))) {
            ticket.setResolvedAt(null);
        }

        String oldStatus = ticket.getStatus();
        ticket.setStatus(status);
        IncidentTicket saved = ticketRepository.save(ticket);

        // LOG ACTION
        auditService.logAction(
            userId, 
            "TICKET_STATUS_UPDATE", 
            "TICKET", 
            id.toString(), 
            "Status changed from " + oldStatus + " to " + status
        );

        return toDTO(saved);
    }

    @Transactional
    public void deleteTicket(Long id) {
        List<TicketComment> comments = commentRepository.findByTicket_Id(id);
        commentRepository.deleteAll(comments);
        ticketRepository.deleteById(id);
    }

    @Transactional
    public CommentResponseDTO addComment(Long ticketId, TicketComment comment) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        comment.setTicket(ticket);

        // Map userId from frontend to User entity
        if (comment.getUserId() != null) {
            User user = userRepository.findById(comment.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + comment.getUserId()));
            comment.setUser(user);
        }

        if (ticket.getFirstResponseAt() == null && "TECHNICIAN".equals(comment.getUserRole())) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            ticketRepository.save(ticket);
        }

        return toCommentDTO(commentRepository.save(comment));
    }

    public List<CommentResponseDTO> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicket_Id(ticketId).stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    private TicketResponseDTO toDTO(IncidentTicket t) {
        return TicketResponseDTO.builder()
                .id(t.getId())
                .resourceId(t.getResource().getId())
                .resourceName(t.getResource().getName())
                .userId(t.getUser().getSupabaseUid())
                .userName(t.getUser().getName())
                .category(t.getCategory())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .imageUrl(t.getImageUrl())
                .firstResponseAt(t.getFirstResponseAt())
                .resolvedAt(t.getResolvedAt())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private CommentResponseDTO toCommentDTO(TicketComment c) {
        return CommentResponseDTO.builder()
                .id(c.getId())
                .text(c.getText())
                .userId(c.getUser().getSupabaseUid())
                .userName(c.getUser().getName())
                .userRole(c.getUserRole())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
