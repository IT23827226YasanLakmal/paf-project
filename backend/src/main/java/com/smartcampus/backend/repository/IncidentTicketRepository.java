package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.IncidentTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {
    List<IncidentTicket> findByResourceId(Long resourceId);
    List<IncidentTicket> findByStatus(String status);
}
