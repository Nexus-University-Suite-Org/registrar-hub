package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    List<NotificationPreference> findByRegistrarId(Long registrarId);

    Optional<NotificationPreference> findByRegistrarIdAndCategory(Long registrarId, String category);
}