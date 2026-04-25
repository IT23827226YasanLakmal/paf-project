package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.AuthRequest;
import com.smartcampus.backend.dto.AuthResponse;
import com.smartcampus.backend.dto.RegisterRequest;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.jdbcTemplate = jdbcTemplate;
    }

    public AuthResponse register(RegisterRequest request) {
        Role role = request.getRole() != null ? request.getRole() : Role.USER;
        
        // Identity & password handled by Supabase, we just save the profile.
        var user = new User(
                request.getSupabaseUid(), // Use the UUID from Supabase
                request.getEmail(),
                request.getName(),
                role
        );
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getSupabaseUid(), user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse authenticate(AuthRequest request) {
        // Note: With Supabase, authentication is primarily on the frontend.
        // This method remains for legacy support or backend-driven auth if needed.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getSupabaseUid(), user.getName(), user.getEmail(), user.getRole());
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse sync(com.smartcampus.backend.dto.SyncRequest request) {
        String newUid = request.getSupabaseUid();
        String email = request.getEmail();

        // 1. Try to find by Supabase UID first
        User user = repository.findById(newUid).orElse(null);

        if (user == null) {
            // 2. If UID not found, check if a user with this email already exists (e.g. from seed data)
            User existingUser = repository.findByEmail(email).orElse(null);
            
            if (existingUser != null) {
                // LINKING: The email exists but has a different UID (likely a seed/fake ID)
                String oldUid = existingUser.getSupabaseUid();
                
                // Update all related tables to the new real UID
                jdbcTemplate.update("UPDATE bookings SET user_id = ? WHERE user_id = ?", newUid, oldUid);
                jdbcTemplate.update("UPDATE incident_tickets SET user_id = ? WHERE user_id = ?", newUid, oldUid);
                jdbcTemplate.update("UPDATE ticket_comments SET user_id = ? WHERE user_id = ?", newUid, oldUid);
                
                // Update the user record itself (Native query because PK is not updatable in JPA)
                jdbcTemplate.update("UPDATE users SET supabase_uid = ? WHERE supabase_uid = ?", newUid, oldUid);
                
                // Refresh the user object from DB with the new ID
                user = repository.findById(newUid).orElseThrow();
            } else {
                // 3. Truly new user, create from scratch
                user = new User();
                user.setSupabaseUid(newUid);
                user.setRole(Role.USER);
            }
        }

        // Update email and preserve role
        user.setEmail(email);
        
        // ONLY set the name if it's currently empty (don't overwrite manual DB changes)
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }

        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getSupabaseUid(), user.getName(), user.getEmail(), user.getRole());
    }
}
