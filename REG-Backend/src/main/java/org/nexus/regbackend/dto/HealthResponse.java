package org.nexus.regbackend.dto;

/**
 * response body for the public health-check endpoint.
 */
public record HealthResponse(String status, String service) {

    public static HealthResponse ok() {
        return new HealthResponse("ok", "nexus-backend");
    }
}
