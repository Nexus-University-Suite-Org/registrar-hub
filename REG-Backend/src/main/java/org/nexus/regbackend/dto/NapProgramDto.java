package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NapProgramDto(
        String programCode,
        String programName,
        String department,
        Integer numberOfYears,
        String status,
        String curriculum) {
}