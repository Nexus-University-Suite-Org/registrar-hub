package org.nexus.regbackend.service.impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.model.EmailTemplate;
import org.nexus.regbackend.repository.EmailTemplateRepository;
import org.nexus.regbackend.service.EmailService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateRepository emailTemplateRepository;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Override
    public void sendOtpEmail(String to, String otp) {
        sendFromTemplate("otp_email", "Your Nexus University Verification Code",
                Map.of("otp", otp), to);
    }

    @Override
    public void sendLecturerWelcomeEmail(String to, String firstName, String setPasswordUrl) {
        sendFromTemplate("lecturer_welcome", "Welcome to Nexus University",
                Map.of("firstName", firstName, "setPasswordUrl", setPasswordUrl, "email", to), to);
    }

    private void sendFromTemplate(String templateKey, String defaultSubject,
                                  Map<String, String> vars, String to) {
        try {
            String subject = defaultSubject;
            String html;
            Optional<EmailTemplate> tplOpt = emailTemplateRepository.findByTemplateKey(templateKey);
            if (tplOpt.isPresent() && tplOpt.get().isActive()) {
                EmailTemplate tpl = tplOpt.get();
                subject = tpl.getSubject();
                html = tpl.getBody();
            } else {
                html = defaultBody(templateKey);
                if (html == null) {
                    log.warn("No template for key '{}' and no fallback defined — skipping email to {}", templateKey, to);
                    return;
                }
            }
            for (Map.Entry<String, String> e : vars.entrySet()) {
                html = html.replace("{" + e.getKey() + "}", e.getValue());
                subject = subject.replace("{" + e.getKey() + "}", e.getValue());
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            // Send From the authenticated SMTP account when configured, so SPF/DKIM
            // align with the real sender and mail lands in the recipient's Inbox
            // instead of Spam/Promotions. Fall back to a branded no-reply otherwise.
            String from = (mailUsername != null && !mailUsername.isBlank())
                    ? "Nexus University <" + mailUsername + ">"
                    : "Nexus University <noreply@nexus.edu>";
            helper.setFrom(from);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("Email dispatched to {} with template '{}'", to, templateKey);
        } catch (Exception e) {
            log.error("Failed to send email to {} (template={}): {}", to, templateKey, e.getMessage(), e);
            // Propagate so callers can record the true send status (e.g. email_sent=false)
            throw new RuntimeException("Failed to send " + templateKey + " email to " + to, e);
        }
    }

    private String defaultBody(String key) {
        return switch (key) {
            case "otp_email" -> """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;"><tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 40px rgba(15,23,42,0.12);">
                      <tr><td style="background:linear-gradient(135deg,#0f172a 0%%,#1e293b 100%%);padding:36px 40px;text-align:center;">
                        <div style="font-size:40px;margin-bottom:10px;">🎓</div>
                        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">Nexus University</h1>
                        <p style="color:#94a3b8;margin:8px 0 0;font-size:13px;font-weight:600;letter-spacing:0.5px;">REGISTRAR PORTAL · ACCOUNT VERIFICATION</p>
                      </td></tr>
                      <tr><td style="padding:40px;">
                        <p style="color:#0f172a;font-size:17px;font-weight:700;margin:0 0 8px;">Hello,</p>
                        <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 12px;">Use the verification code below to complete your registration on the Nexus University Registrar Portal.</p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background-color:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;">
                          <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;font-weight:600;">Your Verification Code</p>
                          <p style="color:#0f172a;font-size:36px;font-weight:800;letter-spacing:10px;margin:0;font-family:'Courier New',monospace;">{otp}</p>
                          <p style="color:#94a3b8;font-size:12px;margin:12px 0 0;">Code expires in 10 minutes</p>
                        </td></tr></table>
                        <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">Do not share this code with anyone. If you did not request this verification, please ignore this email.</p>
                      </td></tr>
                      <tr><td style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">© 2026 Nexus University — Registrar Management System</p>
                        <p style="color:#cbd5e1;font-size:11px;margin:0;">Need help? Contact the Registrar's Office.</p>
                      </td></tr>
                    </table>
                  </td></tr></table>
                </body></html>""";
            case "lecturer_welcome" -> """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;"><tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 40px rgba(15,23,42,0.12);">
                      <tr><td style="background:linear-gradient(135deg,#0f172a 0%%,#1e293b 100%%);padding:36px 40px;text-align:center;">
                        <div style="font-size:40px;margin-bottom:10px;">🎓</div>
                        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">You're on the faculty!</h1>
                        <p style="color:#94a3b8;margin:8px 0 0;font-size:13px;font-weight:600;letter-spacing:0.5px;">NEXUS UNIVERSITY · LECTURER PORTAL</p>
                      </td></tr>
                      <tr><td style="padding:40px;">
                        <p style="color:#0f172a;font-size:17px;font-weight:700;margin:0 0 8px;">Hello {firstName},</p>
                        <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 6px;">You have been added as a lecturer at <strong style="color:#0f172a;">Nexus University</strong>. Please set your password to activate your account and access the Lecturer Portal.</p>
                        <p style="color:#64748b;font-size:13px;margin:0 0 28px;"><span style="font-weight:600;color:#334155;">Account:</span> {email}</p>
                        <table width="100%%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 10px;">
                          <a href="{setPasswordUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f172a 0%%,#1e293b 100%%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:12px;font-size:16px;font-weight:700;">Set Your Password</a>
                        </td></tr></table>
                        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:10px 0 6px;">or open this link in your browser:</p>
                        <p style="text-align:center;margin:0 0 28px;">
                          <a href="{setPasswordUrl}" style="color:#2563eb;font-size:12px;word-break:break-all;text-decoration:underline;">{setPasswordUrl}</a>
                        </p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;"><tr><td style="padding:16px 20px;">
                          <p style="color:#475569;font-size:13px;line-height:1.5;margin:0;">🔒 This invite link expires in <strong>24 hours</strong>. If you did not expect this email, you can safely ignore it.</p>
                        </td></tr></table>
                      </td></tr>
                      <tr><td style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">© 2026 Nexus University — Registrar Management System</p>
                        <p style="color:#cbd5e1;font-size:11px;margin:0;">Need help? Contact the Registrar's Office.</p>
                      </td></tr>
                    </table>
                  </td></tr></table>
                </body></html>""";
            default -> null;
        };
    }
}