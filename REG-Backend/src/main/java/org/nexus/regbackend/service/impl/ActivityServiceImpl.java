package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ActivityDto;
import org.nexus.regbackend.model.Activity;
import org.nexus.regbackend.repository.ActivityRepository;
import org.nexus.regbackend.service.ActivityService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;

    @Override
    public ActivityDto log(ActivityDto dto) {
        String entityType = dto.getEntityType() != null ? dto.getEntityType() : dto.getEntity();
        String entityId = dto.getEntityId() != null ? dto.getEntityId() : "unknown";

        Activity activity = Activity.builder()
                .entityType(entityType != null ? entityType : "unknown")
                .entityId(entityId)
                .entityName(dto.getEntityName() != null ? dto.getEntityName() : "")
                .action(dto.getAction() != null ? dto.getAction() : "unknown")
                .details(dto.getDetails() != null ? dto.getDetails() : "")
                .userId(dto.getUserId() != null ? dto.getUserId() : "")
                .userName(dto.getUserName() != null ? dto.getUserName() : "")
                .build();

        activity = activityRepository.save(activity);
        return toDto(activity);
    }

    private ActivityDto toDto(Activity a) {
        return ActivityDto.builder()
                .id(a.getId())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .entityName(a.getEntityName())
                .action(a.getAction())
                .details(a.getDetails())
                .userId(a.getUserId())
                .userName(a.getUserName())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .build();
    }
}
