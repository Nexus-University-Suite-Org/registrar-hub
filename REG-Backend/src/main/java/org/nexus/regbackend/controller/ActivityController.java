package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.ActivityDto;
import org.nexus.regbackend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityDto>> log(@RequestBody ActivityDto dto) {
        ActivityDto created = activityService.log(dto);
        return ApiResponse.created("Activity logged", created);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityDto>>> list() {
        return ApiResponse.ok("Activities retrieved", List.of());
    }
}
