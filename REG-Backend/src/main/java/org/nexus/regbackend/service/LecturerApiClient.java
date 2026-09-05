package org.nexus.regbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LecturerApiClient {

    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public LecturerApiClient(
            @Value("${lecturer.base-url:http://localhost:8084}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public List<JsonNode> getList(String path) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode node = objectMapper.readTree(response.body());
            if (response.statusCode() >= 400) {
                throw new RuntimeException(
                        "Lecturer backend returned " + response.statusCode() + " for " + path);
            }
            if (node == null || !node.isArray()) {
                return List.of();
            }
            return objectMapper.convertValue(node, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to contact lecturer backend", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while contacting lecturer backend", e);
        }
    }

    public Object getSingle(String path) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new RuntimeException(
                        "Lecturer backend returned " + response.statusCode() + " for " + path);
            }
            return objectMapper.readTree(response.body());
        } catch (IOException e) {
            throw new RuntimeException("Failed to contact lecturer backend", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while contacting lecturer backend", e);
        }
    }

    public Object put(String path, Map<String, Object> body) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new RuntimeException(
                        "Lecturer backend returned " + response.statusCode() + " for " + path);
            }
            return objectMapper.readTree(response.body());
        } catch (IOException e) {
            throw new RuntimeException("Failed to contact lecturer backend", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while contacting lecturer backend", e);
        }
    }

    public Map<String, Object> toMap(JsonNode node) {
        return objectMapper.convertValue(node, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
    }
}