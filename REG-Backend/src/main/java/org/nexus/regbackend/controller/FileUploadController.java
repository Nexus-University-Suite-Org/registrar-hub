package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ApiResponse.error(org.springframework.http.HttpStatus.BAD_REQUEST, "No file selected");
        }

        if (file.getSize() > MAX_SIZE) {
            return ApiResponse.error(org.springframework.http.HttpStatus.BAD_REQUEST, "File too large. Maximum size is 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ApiResponse.error(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            String url = "/api/uploads/" + filename;
            return ApiResponse.ok("File uploaded successfully", Map.of("url", url));

        } catch (IOException e) {
            return ApiResponse.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload file: " + e.getMessage());
        }
    }
}
