package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    //  USER: get their notifications
    @GetMapping("/notifications/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return service.getUserNotifications(userId);
    }

    //  ADMIN: create notification
    @PostMapping("/admin/notifications")
    public Notification createNotification(@RequestBody Map<String, String> body) {

        Long userId = Long.parseLong(body.get("userId"));
        String message = body.get("message");

        return service.createNotification(userId, message);
    }
}