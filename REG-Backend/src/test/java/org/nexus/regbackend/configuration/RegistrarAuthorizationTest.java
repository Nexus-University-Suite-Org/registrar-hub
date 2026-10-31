package org.nexus.regbackend.configuration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.nexus.regbackend.controller.AuthController;
import org.nexus.regbackend.service.JwtService;
import org.nexus.regbackend.service.AuthService;
import org.nexus.regbackend.service.OtpService;
import org.nexus.regbackend.service.impl.RegistrarDetailsService;
import org.nexus.regbackend.util.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = true)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, RegistrarAuthorizationTest.ProtectedProbeController.class})
@TestPropertySource(properties = "reg.cors.allowed-origins=http://localhost")
class RegistrarAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private OtpService otpService;

    @MockitoBean
    private CurrentUser currentUser;

    @MockitoBean
    private NexusIdentityTokenVerifier identityTokenVerifier;

    @MockitoBean
    private RegistrarDetailsService registrarDetailsService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void registrarDataEndpointsRejectAnonymousRequests() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrarDataEndpointsRejectOtherRoles() throws Exception {
        mockMvc.perform(get("/api/students").with(user("student").roles("STUDENT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void registrarRoleCanReachProtectedApi() throws Exception {
        mockMvc.perform(get("/api/private/probe").with(user("registrar").roles("REGISTRAR")))
                .andExpect(status().isOk());
    }

    @Test
    void identityExchangeRemainsPublicToLocalSecurity() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sso")
                        .header("Authorization", "Bearer identity-token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @RestController
    static class ProtectedProbeController {

        @GetMapping("/api/private/probe")
        String probe() {
            return "ok";
        }
    }
}
