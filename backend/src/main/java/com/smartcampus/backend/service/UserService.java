package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepo, NotificationService notificationService) {
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    //   updates user role
    public User updateUserRole(Long userId, String newRole) {

    User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    //  Save old role before updating
    Role oldRole = user.getRole();

    try {
        //  Convert String → Enum
        Role roleEnum = Role.valueOf(newRole.toUpperCase());

        user.setRole(roleEnum);

    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid role: " + newRole);
    }

    //  Save updated user
    User updatedUser = userRepo.save(user);

    //   Create notification AFTER update
    String message = "Your role has been updated from "
            + oldRole + " to " + updatedUser.getRole();

    notificationService.createNotification(updatedUser.getId(), message);

    return updatedUser;
   }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }
}