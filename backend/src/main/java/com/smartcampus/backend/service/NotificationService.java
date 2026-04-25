package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;

    public NotificationService(NotificationRepository notificationRepo, UserRepository userRepo) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
    }

    public Notification createNotification(String userId, String message) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification(user, message);

        return notificationRepo.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepo.findByUser_SupabaseUidOrderByCreatedAtDesc(userId);
    }

    public void deleteNotification(Long id) {
        notificationRepo.deleteById(id);
    }

    public void markAsRead(Long id) {
        Notification n = notificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        n.setRead(true);
        notificationRepo.save(n);
    }
}