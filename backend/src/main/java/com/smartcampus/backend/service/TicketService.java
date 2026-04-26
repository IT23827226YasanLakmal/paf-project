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
import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.TreeMap;
import com.smartcampus.backend.dto.TechnicianStatsDTO;
import com.smartcampus.backend.dto.DailyTrendDTO;

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
        ticket.setImageUrl2(req.getImageUrl2());
        ticket.setImageUrl3(req.getImageUrl3());
        ticket.setStatus("OPEN");

        return toDTO(ticketRepository.save(ticket));
    }

    public List<TicketResponseDTO> getAllTickets(String status, Long resourceId, String userId) {
        List<IncidentTicket> tickets;
        if (userId != null && !userId.isEmpty()) {
            tickets = ticketRepository.findByUser_SupabaseUid(userId);
            // Optionally filter the user's tickets by status or resourceId in memory or via separate repo methods
            if (status != null && !status.isEmpty()) {
                tickets = tickets.stream().filter(t -> t.getStatus().equals(status)).collect(Collectors.toList());
            }
            if (resourceId != null) {
                tickets = tickets.stream().filter(t -> t.getResource().getId().equals(resourceId)).collect(Collectors.toList());
            }
        } else if (status != null && !status.isEmpty()) {
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
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO req, String userId) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        // Authorization check: only owner or technician/admin can update
        // (For now, we just proceed, but in a real app, you'd check ticket.getUser().getSupabaseUid().equals(userId))
        
        if (req.getCategory() != null) ticket.setCategory(req.getCategory());
        if (req.getDescription() != null) ticket.setDescription(req.getDescription());
        if (req.getPriority() != null) ticket.setPriority(req.getPriority());
        if (req.getResourceId() != null) {
            Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));
            ticket.setResource(resource);
        }
        
        IncidentTicket saved = ticketRepository.save(ticket);
        
        auditService.logAction(
            userId, 
            "TICKET_UPDATE", 
            "TICKET", 
            id.toString(), 
            "Ticket details updated"
        );

        return toDTO(saved);
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

    @Transactional
    public TicketResponseDTO assignTicket(Long ticketId, String technicianId) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("User not found: " + technicianId));
        ticket.setAssignedTo(technician);
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(java.time.LocalDateTime.now());
            }
        }
        return toDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponseDTO updateTicketImages(Long id, List<String> imageUrls) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (imageUrls.size() > 0) ticket.setImageUrl(imageUrls.get(0));
        if (imageUrls.size() > 1) ticket.setImageUrl2(imageUrls.get(1));
        if (imageUrls.size() > 2) ticket.setImageUrl3(imageUrls.get(2));
        
        return toDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public CommentResponseDTO updateComment(Long commentId, String newText, String requestingUserId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));
        if (!comment.getUser().getSupabaseUid().equals(requestingUserId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You can only edit your own comments.");
        }
        comment.setText(newText);
        return toCommentDTO(commentRepository.save(comment));
    }

    public TechnicianStatsDTO getTechnicianStats() {
        List<IncidentTicket> allTickets = ticketRepository.findAll();
        
        long total = allTickets.size();
        long active = allTickets.stream().filter(t -> !"RESOLVED".equals(t.getStatus())).count();
        long resolved = allTickets.stream().filter(t -> "RESOLVED".equals(t.getStatus())).count();
        long urgent = allTickets.stream().filter(t -> "URGENT".equals(t.getPriority())).count();

        // Distributions
        Map<String, Long> categoryMap = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory() != null ? t.getCategory() : "Unknown", Collectors.counting()));
        
        List<Map<String, Object>> categoryDistribution = categoryMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        Map<String, Long> priorityMap = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority() != null ? t.getPriority() : "Unknown", Collectors.counting()));
        
        List<Map<String, Object>> priorityDistribution = priorityMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        // Trend (last 7 days)
        LocalDate today = LocalDate.now();
        Map<LocalDate, DailyTrendDTO> trendMap = new TreeMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dayLabel = date.getDayOfWeek().toString().substring(0, 3);
            trendMap.put(date, new DailyTrendDTO(dayLabel, 0, 0));
        }

        for (IncidentTicket t : allTickets) {
            if (t.getCreatedAt() != null) {
                LocalDate createdDate = t.getCreatedAt().toLocalDate();
                if (trendMap.containsKey(createdDate)) {
                    trendMap.get(createdDate).setOpen(trendMap.get(createdDate).getOpen() + 1);
                }
            }
            if (t.getResolvedAt() != null) {
                LocalDate resolvedDate = t.getResolvedAt().toLocalDate();
                if (trendMap.containsKey(resolvedDate)) {
                    trendMap.get(resolvedDate).setSolved(trendMap.get(resolvedDate).getSolved() + 1);
                }
            }
        }

        return TechnicianStatsDTO.builder()
                .totalTickets(total)
                .activeTickets(active)
                .resolvedTickets(resolved)
                .urgentTickets(urgent)
                .categoryDistribution(categoryDistribution)
                .priorityDistribution(priorityDistribution)
                .trend(new ArrayList<>(trendMap.values()))
                .build();
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
                .imageUrl2(t.getImageUrl2())
                .imageUrl3(t.getImageUrl3())
                .rejectionReason(t.getRejectionReason())
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getSupabaseUid() : null)
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getName() : null)
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
