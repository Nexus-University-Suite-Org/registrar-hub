package org.nexus.regbackend.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Binds the {@code otp.*} block from application.yaml.
 */
@Configuration
@ConfigurationProperties(prefix = "otp")
@Getter
@Setter
public class OtpProperties {

    private String secret;
    private int expiryMinutes;
    private int resendCooldownSeconds;
    private int maxSendsPerHour;
    private int maxVerifyAttempts;
    private boolean showInDev;
}
