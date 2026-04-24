package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.dto.BookingUpdateDTO;
import com.smartcampus.backend.model.BookingStatus;
import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO request);

    List<BookingResponseDTO> getBookings(Long userId, Long resourceId, BookingStatus status, boolean isAdmin);

    BookingResponseDTO updateBooking(Long id, BookingUpdateDTO request, Long userId, boolean isAdmin);

    BookingResponseDTO updateBookingStatus(Long id, BookingStatusUpdateDTO request, Long userId, boolean isAdmin);

    void deleteBooking(Long id, Long userId, boolean isAdmin);

    BookingResponseDTO verifyQrToken(String token);
}
