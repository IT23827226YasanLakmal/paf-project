package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.AdminStatsDTO;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemAdminService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final IncidentTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public AdminStatsDTO getAdminStats() {
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.PENDING).size();
        long activeResources = resourceRepository.findByStatus("ACTIVE").size();
        long openTickets = ticketRepository.findByStatus("OPEN").size();
        long totalUsers = userRepository.count();

        // Booking Flow Dynamics (last 6 points for the chart)
        // We'll group by date for the last 6 days
        LocalDate today = LocalDate.now();
        Map<LocalDate, Long> flowMap = new TreeMap<>();
        for (int i = 5; i >= 0; i--) {
            flowMap.put(today.minusDays(i), 0L);
        }

        List<Booking> allBookings = bookingRepository.findAll();
        for (Booking b : allBookings) {
            if (b.getCreatedAt() != null) {
                LocalDate createdDate = b.getCreatedAt().toLocalDate();
                if (flowMap.containsKey(createdDate)) {
                    flowMap.put(createdDate, flowMap.get(createdDate) + 1);
                }
            }
        }

        List<Map<String, Object>> bookingFlow = flowMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey().toString().substring(5)); // e.g., "10-01"
                    m.put("val", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        return AdminStatsDTO.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .activeResources(activeResources)
                .openTickets(openTickets)
                .totalUsers(totalUsers)
                .bookingFlow(bookingFlow)
                .build();
    }
}
