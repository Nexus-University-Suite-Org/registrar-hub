package org.nexus.regbackend.service.impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.service.EmailService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Your Nexus Registrar Verification Code");
            helper.setFrom("Nexus University <noreply@nexus.edu>");

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#0f172a 0%%,#1e293b 100%%);padding:32px 40px;text-align:center;">
                              <div style="font-size:32px;margin-bottom:8px;">🎓</div>
                              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Nexus University</h1>
                              <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">Registrar Portal</p>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <p style="color:#334155;font-size:15px;margin:0 0 24px;">Hello,</p>
                              <p style="color:#334155;font-size:15px;margin:0 0 8px;">Use the verification code below to complete your registration:</p>
                              <!-- OTP Box -->
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                                <tr>
                                  <td style="background-color:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;">
                                    <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your Verification Code</p>
                                    <p style="color:#0f172a;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">%s</p>
                                    <p style="color:#94a3b8;font-size:12px;margin:12px 0 0;">Expires in 10 minutes</p>
                                  </td>
                                </tr>
                              </table>
                              <p style="color:#64748b;font-size:13px;margin:0 0 8px;">For your security, do not share this code with anyone. If you did not request this code, please ignore this email.</p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background-color:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
                              <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">© 2026 Nexus University — Registrar Management System</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(otp);

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("OTP email dispatched to {}", to);
        } catch (Exception e) {
            log.warn("Failed to send OTP email to {}: {} (OTP still available in dev mode)", to, e.getMessage());
        }
    }

    @Override
    public void sendLecturerWelcomeEmail(String to, String firstName, String setPasswordUrl) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Welcome to Nexus University — Set Your Password");
            helper.setFrom("Nexus University <noreply@nexus.edu>");

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#0f172a 0%%,#1e293b 100%%);padding:32px 40px;text-align:center;">
                              <div style="font-size:32px;margin-bottom:8px;">🎓</div>
                              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Nexus University</h1>
                              <p style="color:#94a3b8;margin:4px 0 0;font-size:13px;">Lecturer Portal</p>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:40px;">
                              <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hello %s,</p>
                              <p style="color:#334155;font-size:15px;margin:0 0 20px;">You have been added as a lecturer at <strong>Nexus University</strong>. Your account has been created and you can now set your password to access the Lecturer Portal.</p>

                              <!-- CTA Button -->
                              <table width="100%%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                                <tr>
                                  <td align="center">
                                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#0f172a 0%%,#1e293b 100%%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:12px;font-size:16px;font-weight:600;letter-spacing:-0.3px;">Set Your Password</a>
                                  </td>
                                </tr>
                              </table>

                              <p style="color:#64748b;font-size:13px;margin:0 0 8px;">If the button above does not work, copy and paste this link into your browser:</p>
                              <p style="color:#0f766e;font-size:12px;margin:0 0 20px;word-break:break-all;">%s</p>

                              <p style="color:#64748b;font-size:13px;margin:0 0 8px;">This link will expire in 24 hours. If you did not expect this email, please ignore it.</p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background-color:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
                              <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">© 2026 Nexus University — Registrar Management System</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(firstName, setPasswordUrl, setPasswordUrl);

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("Welcome email dispatched to {}", to);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", to, e.getMessage());
        }
    }
}
