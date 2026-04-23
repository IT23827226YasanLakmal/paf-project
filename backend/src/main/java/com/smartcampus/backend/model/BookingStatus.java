package com.smartcampus.backend.model;

public enum BookingStatus {
    PENDING, // Waiting for admin review
    APPROVED, // Approved - QR token generated
    REJECTED, // Rejected - rejectionReason required
    CANCELLED // Cancelled by user or admin
}