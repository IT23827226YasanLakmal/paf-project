package com.smartcampus.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final String SECRET = "hs6EmDWH4UQBzAc14GxAYwDy6q+GfdnUO2XGmKn8BPu1P32q6sXPKNoAZCd2jhHtTSV1HfVtZ3vGUgDBpQk7vA==";

    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}