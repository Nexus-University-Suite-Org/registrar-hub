package org.nexus.regbackend.configuration;

import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class NexusIdentityTokenVerifier {

    private final String issuerUri;
    private final String audience;
    private volatile JwtDecoder decoder;

    public NexusIdentityTokenVerifier(
            @Value("${NEXUS_IDENTITY_ISSUER_URI:http://localhost:9000}") String issuerUri,
            @Value("${NEXUS_IDENTITY_AUDIENCE:nexus-registrar}") String audience) {
        this.issuerUri = issuerUri;
        this.audience = audience;
    }

    public String verifiedRegistrarEmail(String authorization) {
        if (issuerUri.isBlank() || audience.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Nexus Identity SSO is not configured");
        }
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A Nexus Identity bearer token is required");
        }

        try {
            Jwt jwt = decoder().decode(authorization.substring(7));
            String email = jwt.getClaimAsString("email");
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (!jwt.getAudience().contains(audience)
                    || !"access".equals(jwt.getClaimAsString("token_use"))
                    || !Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))
                    || roles == null
                    || !roles.contains("REGISTRAR")
                    || email == null
                    || email.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "A verified registrar identity is required");
            }
            return email.trim().toLowerCase(Locale.ROOT);
        } catch (JwtException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "The Nexus Identity token is invalid or expired");
        }
    }

    private JwtDecoder decoder() {
        JwtDecoder current = decoder;
        if (current == null) {
            synchronized (this) {
                current = decoder;
                if (current == null) {
                    current = JwtDecoders.fromIssuerLocation(issuerUri);
                    decoder = current;
                }
            }
        }
        return current;
    }
}
