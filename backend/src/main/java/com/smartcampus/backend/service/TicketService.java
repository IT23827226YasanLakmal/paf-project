package com.smartcampus.backend.service;

import com.smartcampus.backend.model.IncidentTicket;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
