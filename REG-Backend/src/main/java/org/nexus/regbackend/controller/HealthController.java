package org.nexus.regbackend.controller;

import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * publicly accessible health-check endpoint.
 * No authentication required.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> healthCheck() {
        return ApiResponse.ok("Health check passed", HealthResponse.ok());
    }
}
