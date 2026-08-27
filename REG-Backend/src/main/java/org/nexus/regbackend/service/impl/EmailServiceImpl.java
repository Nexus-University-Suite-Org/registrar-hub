package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.service.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Nexus Registrar Sign-Up Code");
        message.setText("""
                Your one-time verification code is: %s
                
                This code expires in 10 minutes. Do not share it with anyone.
                
                If you did not request this code, please ignore this email.
                """.formatted(otp));

        mailSender.send(message);
        log.info("OTP email dispatched to {}", to);
    }
}
