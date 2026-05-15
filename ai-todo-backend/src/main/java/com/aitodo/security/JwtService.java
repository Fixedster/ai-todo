package com.aitodo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    private final StringRedisTemplate redisTemplate;

    public JwtService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId, String username) {
        return generateToken(userId, username, "access", accessTokenExpiration);
    }

    public String generateRefreshToken(Long userId, String username) {
        return generateToken(userId, username, "refresh", refreshTokenExpiration);
    }

    private String generateToken(Long userId, String username, String type, Long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("type", type)
                .claim("jti", jti)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            if (claims.getExpiration().before(new Date())) {
                return false;
            }
            String jti = claims.get("jti", String.class);
            return !isTokenBlacklisted(jti);
        } catch (Exception e) {
            return false;
        }
    }

    public void blacklistToken(String token) {
        try {
            Claims claims = parseToken(token);
            String jti = claims.get("jti", String.class);
            Date expiration = claims.getExpiration();
            long ttl = expiration.getTime() - System.currentTimeMillis();
            if (ttl > 0) {
                redisTemplate.opsForValue().set("token:blacklist:" + jti, "1", ttl, TimeUnit.MILLISECONDS);
            }
        } catch (Exception e) {
            // Ignore invalid tokens
        }
    }

    private boolean isTokenBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("token:blacklist:" + jti));
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.valueOf(claims.getSubject());
    }

    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("username", String.class);
    }

    public String getTokenType(String token) {
        Claims claims = parseToken(token);
        return claims.get("type", String.class);
    }
}
