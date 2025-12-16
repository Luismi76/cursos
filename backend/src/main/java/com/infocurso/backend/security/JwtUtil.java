package com.infocurso.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "mi-clave-secreta-super-segura-para-jwt-con-mas-de-32-bytes";
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24; // 1 día

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generarToken(String email, UUID userId, String rol) {
        return Jwts.builder()
                .setSubject(email)
                .claim("id", userId.toString())
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extraerEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extraerRol(String token) {
        return getClaims(token).get("rol", String.class);
    }

    public boolean esTokenValido(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getAllClaims(String token) {
        return getClaims(token);
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
