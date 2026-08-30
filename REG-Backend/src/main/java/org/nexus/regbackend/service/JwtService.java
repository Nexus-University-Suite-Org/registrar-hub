package org.nexus.regbackend.service;

import org.nexus.regbackend.model.Registrar;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * JWT token lifecycle — issue, validate, extract claims.
 */
public interface JwtService {

    /** Generate a short-lived access token for the given registrar. */
    String generateAccessToken(Registrar registrar);

    /** Extract the subject (email) from a token. */
    String extractSubject(String token);

    /** Return true if the token signature is valid and it has not expired. */
    boolean isTokenValid(String token, UserDetails userDetails);

    /** Generate a set-password token for a newly created lecturer. */
    String generateSetPasswordToken(String email);

    /** Verify a set-password token and return the email if valid, null otherwise. */
    String verifySetPasswordToken(String token);
}
