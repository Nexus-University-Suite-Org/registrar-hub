package org.nexus.regbackend.exception;

import org.nexus.regbackend.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Translates all application exceptions into the uniform {@link ApiResponse} envelope.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .sorted()
                .collect(Collectors.joining("; "));
        return ApiResponse.error(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException ex) {
        return ApiResponse.error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(OtpException.class)
    public ResponseEntity<ApiResponse<Void>> handleOtp(OtpException ex) {
        return ApiResponse.error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicate(DuplicateResourceException ex) {
        return ApiResponse.error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (msg != null && msg.contains("duplicate key")) {
            if (msg.contains("email")) {
                return ApiResponse.error(HttpStatus.CONFLICT, "A record with this email already exists");
            }
            if (msg.contains("lecturer_number")) {
                return ApiResponse.error(HttpStatus.CONFLICT, "A lecturer with this number already exists");
            }
            if (msg.contains("code")) {
                return ApiResponse.error(HttpStatus.CONFLICT, "A record with this code already exists");
            }
            return ApiResponse.error(HttpStatus.CONFLICT, "A record with this value already exists");
        }
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "Database constraint violation: " + (msg != null ? msg : "unknown error"));
    }

    @ExceptionHandler(org.springframework.transaction.TransactionSystemException.class)
    public ResponseEntity<ApiResponse<Void>> handleTransactionSystem(org.springframework.transaction.TransactionSystemException ex) {
        Throwable cause = ex.getRootCause();
        if (cause instanceof DataIntegrityViolationException dives) {
            return handleDataIntegrity(dives);
        }
        return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Transaction error: " + (cause != null ? cause.getMessage() : ex.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ApiResponse.error(HttpStatus.BAD_REQUEST, "File too large. Maximum size is 10MB");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;
        return ApiResponse.error(status, ex.getReason());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        ex.printStackTrace();
        String fullMsg = ex.getMessage();
        Throwable cause = ex.getCause();
        while (cause != null) {
            if (cause.getMessage() != null) fullMsg += " | " + cause.getMessage();
            cause = cause.getCause();
        }
        if (fullMsg.contains("duplicate key")) {
            if (fullMsg.contains("email")) {
                return ApiResponse.error(HttpStatus.CONFLICT, "A record with this email already exists");
            }
            if (fullMsg.contains("lecturer_number")) {
                return ApiResponse.error(HttpStatus.CONFLICT, "A lecturer with this number already exists");
            }
            if (fullMsg.contains("code")) {
                return ApiResponse.error(HttpStatus.CONFLICT, "A record with this code already exists");
            }
            return ApiResponse.error(HttpStatus.CONFLICT, "A record with this value already exists");
        }
        return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred: " + ex.getMessage());
    }
}
