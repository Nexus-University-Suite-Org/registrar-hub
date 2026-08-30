package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.SignUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SignUpRepository extends JpaRepository<SignUp, Long> {

    List<SignUp> findByLecturerId(Long lecturerId);
}
