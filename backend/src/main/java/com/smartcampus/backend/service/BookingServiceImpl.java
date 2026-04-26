package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.dto.BookingUpdateDTO;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    // ── POST /api/bookings ─────────────────────────────────────────────────
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO req) {
        if (!req.getEndTime().isAfter(req.getStartTime()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        long mins = Duration.between(req.getStartTime(), req.getEndTime()).toMinutes();
        if (mins < 30)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum duration is 30 minutes.");
        if (mins > 480)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum duration is 8 hours.");

        // Verify Resource and User exist
        Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean conflict = bookingRepository.existsConflict(
                req.getResourceId(), req.getStartTime(), req.getEndTime());
        if (conflict) {
            List<Booking> conflicts = bookingRepository.findConflicts(
                    req.getResourceId(), req.getStartTime(), req.getEndTime());
            log.warn("Booking conflict for resourceId={}", req.getResourceId());
            throw new BookingConflictException(
                    "This resource is already booked during the requested time slot.",
                    conflicts.stream().map(this::toDTO).collect(Collectors.toList()));
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .purpose(req.getPurpose())
                .attendees(req.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return toDTO(bookingRepository.save(booking));
    }

    // ── GET /api/bookings ──────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookings(String userId, Long resourceId,
            BookingStatus status, boolean isAdmin) {
        List<Booking> result;
        if (isAdmin) {
            if (resourceId != null)
                result = bookingRepository.findByResource_IdOrderByCreatedAtDesc(resourceId);
            else if (status != null)
                result = bookingRepository.findByStatusOrderByCreatedAtDesc(status);
            else
                result = bookingRepository.findAll();
        } else {
            if (status != null)
                result = bookingRepository.findByUser_SupabaseUidAndStatusOrderByCreatedAtDesc(userId, status);
            else
                result = bookingRepository.findByUser_SupabaseUidOrderByCreatedAtDesc(userId);
        }
        return result.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── GET /api/bookings/verify-qr/{token} ───────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO verifyQrToken(String token) {
        Booking booking = bookingRepository.findByQrCodeToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invalid or expired QR code."));

        if (booking.getStatus() != BookingStatus.APPROVED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This booking is not currently approved (status: " + booking.getStatus() + ").");

        return toDTO(booking);
    }

    // ── PUT /api/bookings/{id} ─────────────────────────────────────────────
    @Override
    public BookingResponseDTO updateBooking(Long id, BookingUpdateDTO req,
            String userId, boolean isAdmin) {
        Booking booking = findOrThrow(id);

        if (booking.getStatus() != BookingStatus.PENDING)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be edited. Current status: " + booking.getStatus());

        if (!isAdmin && !booking.getUser().getSupabaseUid().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only edit your own bookings.");

        if (!req.getEndTime().isAfter(req.getStartTime()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");

        boolean conflict = bookingRepository.existsConflictExcluding(
                booking.getResource().getId(), req.getStartTime(), req.getEndTime(), id);
        if (conflict) {
            List<Booking> conflicts = bookingRepository.findConflictsExcluding(
                    booking.getResource().getId(), req.getStartTime(), req.getEndTime(), id);
            throw new BookingConflictException(
                    "The time slot conflicts with an existing booking.",
                    conflicts.stream().map(this::toDTO).collect(Collectors.toList()));
        }

        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setPurpose(req.getPurpose());
        booking.setAttendees(req.getAttendees());

        return toDTO(bookingRepository.save(booking));
    }

    // ── PATCH /api/bookings/{id}/status ───────────────────────────────────
    @Override
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatusUpdateDTO req,
            String userId, boolean isAdmin) {
        Booking booking = findOrThrow(id);

        if (!isAdmin) {
            if (!booking.getUser().getSupabaseUid().equals(userId))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            if (req.getStatus() != BookingStatus.CANCELLED)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Users can only cancel");

            booking.setStatus(BookingStatus.CANCELLED);
            booking.setAdminNote(req.getAdminNote());
            booking.setReviewedBy(userId);
            return toDTO(bookingRepository.save(booking));
        }

        validateTransition(booking.getStatus(), req.getStatus());
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(req.getStatus());
        booking.setReviewedBy(userId);
        booking.setRejectionReason(req.getRejectionReason());
        booking.setAdminNote(req.getAdminNote());

        if (req.getStatus() == BookingStatus.APPROVED && booking.getQrCodeToken() == null)
            booking.setQrCodeToken(UUID.randomUUID().toString().replace("-", ""));

        Booking saved = bookingRepository.save(booking);

        // LOG ACTION
        auditService.logAction(
                userId,
                "BOOKING_STATUS_UPDATE",
                "BOOKING",
                id.toString(),
                "Status changed from " + oldStatus + " to " + req.getStatus());

        return toDTO(saved);
    }

    // ── DELETE /api/bookings/{id} ──────────────────────────────────────────
    @Override
    public void deleteBooking(Long id, String userId, boolean isAdmin) {
        Booking booking = findOrThrow(id);
        if (!isAdmin && !booking.getUser().getSupabaseUid().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        bookingRepository.delete(booking);
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private Booking findOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + id));
    }

    private void validateTransition(BookingStatus from, BookingStatus to) {
        boolean ok = switch (from) {
            case PENDING ->
                to == BookingStatus.APPROVED || to == BookingStatus.REJECTED || to == BookingStatus.CANCELLED;
            case APPROVED -> to == BookingStatus.CANCELLED;
            default -> false;
        };
        if (!ok)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid transition");
    }

    private BookingResponseDTO toDTO(Booking b) {
        return BookingResponseDTO.builder()
                .id(b.getId())
                .resourceId(b.getResource().getId())
                .userId(b.getUser().getSupabaseUid())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .attendees(b.getAttendees())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .adminNote(b.getAdminNote())
                .reviewedBy(b.getReviewedBy())
                .qrCodeToken(b.getQrCodeToken())
                .durationMinutes(Duration.between(b.getStartTime(), b.getEndTime()).toMinutes())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    public static class BookingConflictException extends RuntimeException {
        private final List<BookingResponseDTO> conflicts;

        public BookingConflictException(String msg, List<BookingResponseDTO> conflicts) {
            super(msg);
            this.conflicts = conflicts;
        }

        public List<BookingResponseDTO> getConflicts() {
            return conflicts;
        }
    }
}