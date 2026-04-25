package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.RoleDTO;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
    return userService.getAllUsers();
    }

    @GetMapping("/me")
    public User getCurrentUser() {
    return (User) org.springframework.security.core.context.SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getPrincipal();
    }

    //  ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public User updateUserRole(
            @PathVariable String id,
            @RequestBody RoleDTO request,
            @RequestHeader(value = "X-User-Id", required = false) String adminId
    ) {
        return userService.updateUserRole(id, request.getRole(), adminId);
    }
}