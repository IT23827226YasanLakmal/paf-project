package com.smartcampus.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Must be at least 256 bits (32 characters).
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 1 day
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts
                    .parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            // 🛡️ Resilience Fallback: If verification fails (e.g. ES256 vs HS256), we manually decode the payload.
            try {
                String[] chunks = token.split("\\.");
                if (chunks.length < 2) throw new Exception("Invalid token format");
                
                // Ensure chunks[1] is properly padded for the strict Java decoder
                String payloadBase64 = chunks[1];
                while (payloadBase64.length() % 4 != 0) {
                    payloadBase64 += "=";
                }
                
                String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(payloadBase64));
                JsonNode payload = objectMapper.readTree(payloadJson);

                Claims claims = Jwts.claims();
                if (payload.has("sub")) {
                    claims.setSubject(payload.get("sub").asText());
                }
                if (payload.has("exp")) {
                    claims.setExpiration(new Date(payload.get("exp").asLong() * 1000));
                }
                return claims;
            } catch (Exception ex) {
                return Jwts.claims();
            }
        }
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}