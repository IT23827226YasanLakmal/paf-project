package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

  // Conflict detection — POST (new booking)
  @Query("""
      SELECT COUNT(b) > 0 FROM Booking b
      WHERE b.resource.id = :resourceId
        AND (b.status = 'APPROVED' OR b.status = 'PENDING')
        AND b.startTime < :endTime
        AND :startTime < b.endTime
      """)
  boolean existsConflict(
      @Param("resourceId") Long resourceId,
      @Param("startTime") LocalDateTime startTime,
      @Param("endTime") LocalDateTime endTime);

  @Query("""
      SELECT b FROM Booking b
      WHERE b.resource.id = :resourceId
        AND (b.status = 'APPROVED' OR b.status = 'PENDING')
        AND b.startTime < :endTime
        AND :startTime < b.endTime
      ORDER BY b.startTime ASC
      """)
  List<Booking> findConflicts(
      @Param("resourceId") Long resourceId,
      @Param("startTime") LocalDateTime startTime,
      @Param("endTime") LocalDateTime endTime);

  // Conflict detection — PUT (exclude the booking being edited)
  @Query("""
      SELECT COUNT(b) > 0 FROM Booking b
      WHERE b.resource.id = :resourceId
        AND (b.status = 'APPROVED' OR b.status = 'PENDING')
        AND b.id <> :excludeId
        AND b.startTime < :endTime
        AND :startTime < b.endTime
      """)
  boolean existsConflictExcluding(
      @Param("resourceId") Long resourceId,
      @Param("startTime") LocalDateTime startTime,
      @Param("endTime") LocalDateTime endTime,
      @Param("excludeId") Long excludeId);

  @Query("""
      SELECT b FROM Booking b
      WHERE b.resource.id = :resourceId
        AND (b.status = 'APPROVED' OR b.status = 'PENDING')
        AND b.id <> :excludeId
        AND b.startTime < :endTime
        AND :startTime < b.endTime
      ORDER BY b.startTime ASC
      """)
  List<Booking> findConflictsExcluding(
      @Param("resourceId") Long resourceId,
      @Param("startTime") LocalDateTime startTime,
      @Param("endTime") LocalDateTime endTime,
      @Param("excludeId") Long excludeId);

  // Filtered queries using object traversal
  List<Booking> findByUser_SupabaseUidOrderByCreatedAtDesc(String supabaseUid);

  List<Booking> findByResource_IdOrderByCreatedAtDesc(Long resourceId);

  List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

  List<Booking> findByUser_SupabaseUidAndStatusOrderByCreatedAtDesc(String supabaseUid, BookingStatus status);

  Optional<Booking> findByQrCodeToken(String token);
}