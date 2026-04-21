package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.RoleDTO;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

     //  ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public User updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleDTO request
    ) {
        return userService.updateUserRole(id, request.getRole());
    }
}