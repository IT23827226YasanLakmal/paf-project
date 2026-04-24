package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.dto.BookingUpdateDTO;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TEMP AUTH: Headers used until Role 4 adds Spring Security + JWT.
 * X-User-Id → current user's ID
 * X-Is-Admin → "true" if admin
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking workflow and conflict prevention")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings
    @PostMapping
    @Operation(summary = "Request a booking (with conflict detection)")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        request.setUserId(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    // GET /api/bookings
    @GetMapping
    @Operation(summary = "Get bookings — user sees own, admin sees all")
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) BookingStatus status,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId,
            @RequestHeader(value = "X-Is-Admin", defaultValue = "false") boolean isAdmin) {

        Long effectiveUserId = (isAdmin && userId != null) ? userId : currentUserId;
        return ResponseEntity.ok(bookingService.getBookings(effectiveUserId, resourceId, status, isAdmin));
    }

    // GET /api/bookings/verify-qr/{token}
    // PUBLIC — no auth required, scanned by anyone at the facility entrance
    @GetMapping("/verify-qr/{token}")
    @Operation(summary = "Verify a booking by QR token — returns booking details for check-in")
    public ResponseEntity<BookingResponseDTO> verifyQrToken(@PathVariable String token) {
        return ResponseEntity.ok(bookingService.verifyQrToken(token));
    }

    // PUT /api/bookings/{id}
    @PutMapping("/{id}")
    @Operation(summary = "Edit a PENDING booking")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingUpdateDTO request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-Is-Admin", defaultValue = "false") boolean isAdmin) {

        return ResponseEntity.ok(bookingService.updateBooking(id, request, userId, isAdmin));
    }

    // PATCH /api/bookings/{id}/status
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status (admin: all transitions; user: cancel own only)")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateDTO request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId,
            @RequestHeader(value = "X-Is-Admin", defaultValue = "false") boolean isAdmin) {

        if (!isAdmin && request.getStatus() != BookingStatus.CANCELLED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request, currentUserId, isAdmin));
    }

    // DELETE /api/bookings/{id}
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a booking (REJECTED / CANCELLED / overdue APPROVED only)")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-Is-Admin", defaultValue = "false") boolean isAdmin) {

        bookingService.deleteBooking(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}