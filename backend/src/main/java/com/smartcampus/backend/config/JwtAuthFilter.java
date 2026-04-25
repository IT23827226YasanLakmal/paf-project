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


            // 🔥 Extract Supabase UUID (sub claim) from token
            String userId = jwtService.extractUsername(token);


            // Only set auth if not already set
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 🔥 Load user from database using Supabase UUID
                User user = userRepository.findById(userId)
                        .orElse(null);

                if (user != null && jwtService.isTokenValid(token, user)) {

                    // 🔥 IMPORTANT: Spring requires ROLE_ prefix
                    String role = "ROLE_" + user.getRole().name();


                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(role)
                    );

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user,   // principal
                                    null,
                                    authorities
                            );
                    
                    authToken.setDetails(
                            new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 🔥 Set authentication
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                } else {
                }
            }

        } catch (Exception e) {
            // JWT processing error log (optional)
        }

        filterChain.doFilter(request, response);
    }
}