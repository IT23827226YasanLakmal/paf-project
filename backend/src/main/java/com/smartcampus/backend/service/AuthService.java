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

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
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

    public AuthResponse sync(com.smartcampus.backend.dto.SyncRequest request) {
        User user = repository.findById(request.getSupabaseUid())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setSupabaseUid(request.getSupabaseUid());
                    newUser.setRole(Role.USER); // Default role
                    return newUser;
                });

        user.setEmail(request.getEmail());
        user.setName(request.getName());
        
        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getSupabaseUid(), user.getName(), user.getEmail(), user.getRole());
    }
}
