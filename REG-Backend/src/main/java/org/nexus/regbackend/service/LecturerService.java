package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.LecturerDto;

import java.util.List;

public interface LecturerService {
    List<LecturerDto> listAll(String search);
    LecturerDto getById(Long id);
    LecturerDto create(LecturerDto dto);
    LecturerDto update(Long id, LecturerDto dto);
    void delete(Long id);
}
