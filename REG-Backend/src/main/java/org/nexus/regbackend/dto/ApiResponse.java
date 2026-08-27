package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Uniform API envelope for every response — success or error.
 *
 * <pre>
 * {
 *   "status":  "SUCCESS",
 *   "message": "Health check passed",
 *   "data":    { ... }          // omitted on error responses
 * }
 * </pre>
 *
 * @param <T> type of the payload carried in {@code data}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(String status, String message, T data) {

    public enum Status {
        SUCCESS,
        ERROR
    }

    // ── Success factories ────────────────────────────────────────────────────

    public static <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(Status.SUCCESS.name(), message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(String message, T data) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(Status.SUCCESS.name(), message, data));
    }

    // ── Error factories ──────────────────────────────────────────────────────

    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus httpStatus, String message) {
        return ResponseEntity
                .status(httpStatus)
                .body(new ApiResponse<>(Status.ERROR.name(), message, null));
    }
}
