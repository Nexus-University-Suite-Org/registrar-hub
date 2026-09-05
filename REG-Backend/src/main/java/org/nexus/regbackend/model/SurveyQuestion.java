package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * A single question within an evaluation survey.
 */
@Entity
@Table(name = "survey_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyQuestion {

    public enum Type {
        RATING,
        TEXT,
        CHOICE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_id", nullable = false)
    private EvaluationSurvey survey;

    @Column(nullable = false, length = 500)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    @Column(nullable = false)
    private boolean required;

    @Column(nullable = false)
    private Integer sortOrder;

    /** Comma-separated options for CHOICE questions. */
    @Column(columnDefinition = "TEXT")
    private String options;
}