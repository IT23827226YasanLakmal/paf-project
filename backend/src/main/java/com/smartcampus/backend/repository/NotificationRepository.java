package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_SupabaseUidOrderByCreatedAtDesc(String supabaseUid);
}