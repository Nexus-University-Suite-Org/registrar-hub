package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.EvaluationSurvey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationSurveyRepository extends JpaRepository<EvaluationSurvey, Long> {

    List<EvaluationSurvey> findAllByOrderByCreatedAtDesc();
}