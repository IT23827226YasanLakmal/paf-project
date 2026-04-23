package com.smartcampus.backend.config;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // ❌ No token → skip request
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);

            System.out.println("Incoming JWT: " + token);

            // 🔥 Extract email from token
            String email = jwtService.extractEmail(token);

            System.out.println("Extracted email: " + email);

            // Only set auth if not already set
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 🔥 Load user from database
                User user = userRepository.findByEmail(email)
                        .orElse(null);

                if (user != null) {

                    // 🔥 IMPORTANT: Spring requires ROLE_ prefix
                    String role = "ROLE_" + user.getRole().name();

                    System.out.println("Authenticated user: " + email);
                    System.out.println("Role from DB: " + role);

                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(role)
                    );

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user,   // principal
                                    null,
                                    authorities
                            );

                    // 🔥 Set authentication
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                } else {
                    System.out.println("User NOT found in DB for email: " + email);
                }
            }

        } catch (Exception e) {
            System.out.println("JWT Processing Error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}