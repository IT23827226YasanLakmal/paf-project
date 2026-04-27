package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.TicketRequestDTO;
import com.smartcampus.backend.dto.TicketResponseDTO;
import com.smartcampus.backend.model.IncidentTicket;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.repository.IncidentTicketRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private IncidentTicketRepository ticketRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private TicketService ticketService;

    private User testUser;
    private Resource testResource;

    @BeforeEach
    void setUp() {
        testUser = new User("user-uuid", "test@example.com", "Test User", Role.USER);
        testResource = new Resource();
        testResource.setId(102L);
        testResource.setName("Lecture Hall A");
    }

    @Test
    void createTicket_Success() {
        // Arrange
        TicketRequestDTO req = TicketRequestDTO.builder()
                .resourceId(102L)
                .userId("user-uuid")
                .category("HARDWARE")
                .description("Broken projector")
                .priority("HIGH")
                .build();

        when(resourceRepository.findById(102L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById("user-uuid")).thenReturn(Optional.of(testUser));
        when(ticketRepository.save(any(IncidentTicket.class))).thenAnswer(i -> {
            IncidentTicket t = i.getArgument(0);
            t.setId(1L);
            return t;
        });

        // Act
        TicketResponseDTO result = ticketService.createTicket(req);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Broken projector", result.getDescription());
        assertEquals("Lecture Hall A", result.getResourceName());
        verify(ticketRepository).save(any(IncidentTicket.class));
    }

    @Test
    void createTicket_ResourceNotFound() {
        // Arrange
        TicketRequestDTO req = TicketRequestDTO.builder()
                .resourceId(999L)
                .userId("user-uuid")
                .build();

        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> ticketService.createTicket(req));
        verify(ticketRepository, never()).save(any());
    }
}
