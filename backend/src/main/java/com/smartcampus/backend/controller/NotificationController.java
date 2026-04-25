package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    //  Get logged-in user's notifications
    @GetMapping
    public List<Notification> getUserNotifications() {

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return service.getUserNotifications(user.getId());
    }

    //  Delete notification
    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        service.deleteNotification(id);
    }

    //  Mark as read
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BOOKING_OFFICER', 'FACILITY_MANAGER')")
    @PostMapping
    public Notification createNotification(@RequestBody Map<String, String> body) {
    Long userId = Long.parseLong(body.get("userId"));
    String message = body.get("message");
    return service.createNotification(userId, message);
    }
}