package org.nexus.regbackend.service.impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.configuration.JwtProperties;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.service.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final JwtProperties jwtProperties;

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    public String generateAccessToken(Registrar registrar) {
        return Jwts.builder()
                .subject(registrar.getEmail())
                .claims(Map.of(
                        "role",     registrar.getRole().name(),
                        "userId",   registrar.getId(),
                        "username", registrar.getUsername()
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtProperties.getAccessTokenExpiryMs()))
                .signWith(signingKey())
                .compact();
    }

    @Override
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String subject = extractSubject(token);
        return subject.equals(userDetails.getUsername()) && !isExpired(token);
    }

    @Override
    public String generateSetPasswordToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("purpose", "set-password"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)) // 24 hours
                .signWith(signingKey())
                .compact();
    }

    @Override
    public String verifySetPasswordToken(String token) {
        try {
            Claims claims = parseAllClaims(token);
            if ("set-password".equals(claims.get("purpose", String.class)) && !isExpired(token)) {
                return claims.getSubject();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(parseAllClaims(token));
    }

    private Claims parseAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(
                jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }
}
