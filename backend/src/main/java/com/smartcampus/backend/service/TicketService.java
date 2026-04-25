package com.smartcampus.backend.service;

import com.smartcampus.backend.model.IncidentTicket;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;

    @Transactional
    public IncidentTicket createTicket(IncidentTicket ticket) {
        if (ticket.getStatus() == null) {
            ticket.setStatus("OPEN");
        }
        return ticketRepository.save(ticket);
    }

    public List<IncidentTicket> getAllTickets(String status, Long resourceId) {
        if (status != null && !status.isEmpty()) {
            return ticketRepository.findByStatus(status);
        } else if (resourceId != null) {
            return ticketRepository.findByResourceId(resourceId);
        }
        return ticketRepository.findAll();
    }

    public IncidentTicket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    @Transactional
    public IncidentTicket updateTicketStatus(Long id, String status) {
        IncidentTicket ticket = getTicketById(id);
        
        // SLA: Tracking First Response (when moving out of OPEN)
        if (ticket.getFirstResponseAt() == null && !"OPEN".equals(status)) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        // SLA: Tracking Resolution
        if ("RESOLVED".equals(status)) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (ticket.getResolvedAt() != null && ("OPEN".equals(status) || "IN_PROGRESS".equals(status))) {
            // If reopened, clear resolved timestamp
            ticket.setResolvedAt(null);
        }

        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        List<TicketComment> comments = commentRepository.findByTicketId(id);
        commentRepository.deleteAll(comments);
        ticketRepository.deleteById(id);
    }

    @Transactional
    public TicketComment addComment(Long ticketId, TicketComment comment) {
        IncidentTicket ticket = getTicketById(ticketId); // verify exists
        comment.setTicketId(ticket.getId());

        // SLA: Tracking First Response (if technician comments first)
        if (ticket.getFirstResponseAt() == null && "TECHNICIAN".equals(comment.getUserRole())) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            ticketRepository.save(ticket);
        }

        return commentRepository.save(comment);
    }

    public List<TicketComment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
