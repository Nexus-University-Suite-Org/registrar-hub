package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findTop50ByOrderByCreatedAtDesc();
}
