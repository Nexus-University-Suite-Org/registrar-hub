package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.Registrar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrarRepository extends JpaRepository<Registrar, Long> {

    Optional<Registrar> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByStaffId(String staffId);
}
