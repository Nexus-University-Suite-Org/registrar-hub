package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads a registrar by email (the JWT subject) for Spring Security.
 * Role is read from the persisted record — never inferred from the identifier.
 */
@Service
@RequiredArgsConstructor
public class RegistrarDetailsService implements UserDetailsService {

    private final RegistrarRepository registrarRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return registrarRepository.findByEmail(email.toLowerCase().trim())
                .map(registrar -> new User(
                        registrar.getEmail(),
                        registrar.getPasswordHash(),
                        List.of(new SimpleGrantedAuthority("ROLE_" + registrar.getRole().name()))
                ))
                .orElseThrow(() -> new UsernameNotFoundException("Registrar not found: " + email));
    }
}
