package com.smartcampus.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Map;

@Service
public class JwtService {

    // 🔥 Extract email WITHOUT verifying signature (Supabase compatible)
    public String extractEmail(String token) {
        try {
            String[] parts = token.split("\\.");

            if (parts.length < 2) {
                throw new RuntimeException("Invalid JWT format");
            }

            // Decode payload (middle part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> claims = mapper.readValue(payload, Map.class);

            String email = (String) claims.get("email");

            System.out.println("Extracted email: " + email);

            return email;

        } catch (Exception e) {
            System.out.println("JWT Decode Error: " + e.getMessage());
            return null;
        }
    }
}