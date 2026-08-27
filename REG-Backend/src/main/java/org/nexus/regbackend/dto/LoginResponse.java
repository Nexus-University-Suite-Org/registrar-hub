package org.nexus.regbackend.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * REG_UCD_002 — login response.
 * Returns access token, refresh token, and a slim user + profile object.
 */
@Getter
@Builder
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long   expiresIn;      // access token lifetime in seconds

    private UserDto   user;
    private ProfileDto profile;

    // ── Nested projections ────────────────────────────────────────────────────

    @Getter
    @Builder
    public static class UserDto {
        private Long   id;
        private String email;
        private String username;
        private String role;
    }

    @Getter
    @Builder
    public static class ProfileDto {
        private String firstName;
        private String lastName;
        private String staffId;
        private String institution;
        private String department;
        private String phoneNumber;
    }
}
