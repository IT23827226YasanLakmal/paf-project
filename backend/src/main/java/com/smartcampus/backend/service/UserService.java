package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    //  ADMIN updates user role
    public User updateUserRole(Long userId, String newRole) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            //  Convert String to Enum
            Role roleEnum = Role.valueOf(newRole.toUpperCase());

            user.setRole(roleEnum);

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + newRole);
        }

        return userRepo.save(user);
    }

    public List<User> getAllUsers() {
    return userRepo.findAll();
    }
}