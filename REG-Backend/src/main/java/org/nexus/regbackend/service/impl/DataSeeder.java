package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.model.Department;
import org.nexus.regbackend.model.EmailTemplate;
import org.nexus.regbackend.model.SiteSettings;
import org.nexus.regbackend.model.Specialization;
import org.nexus.regbackend.repository.DepartmentRepository;
import org.nexus.regbackend.repository.EmailTemplateRepository;
import org.nexus.regbackend.repository.SiteSettingsRepository;
import org.nexus.regbackend.repository.SpecializationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;
    private final SiteSettingsRepository siteSettingsRepository;
    private final EmailTemplateRepository emailTemplateRepository;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            seedDepartments();
            seedSpecializations();
            log.info("Seeded {} departments and {} specializations",
                    departmentRepository.count(), specializationRepository.count());
        }
        if (siteSettingsRepository.count() == 0) {
            seedSiteSettings();
        }
        if (emailTemplateRepository.count() == 0) {
            seedEmailTemplates();
        }
    }

    private void seedSiteSettings() {
        siteSettingsRepository.save(SiteSettings.builder()
                .id(1L)
                .siteName("Registrar Portal")
                .tagline("Nexus University Registrar Management System")
                .primaryColor("24 100% 50%")
                .metaDescription("Registrar Portal")
                .build());
        log.info("Seeded site branding settings");
    }

    private void seedEmailTemplates() {
        emailTemplateRepository.save(EmailTemplate.builder()
                .templateKey("otp_email")
                .name("OTP Verification Email")
                .subject("Your Nexus University Verification Code")
                .description("Verification code sent during registrar sign-up. Placeholder: {otp}")
                .body(otpBody())
                .isActive(true)
                .build());
        emailTemplateRepository.save(EmailTemplate.builder()
                .templateKey("lecturer_welcome")
                .name("Lecturer Welcome Email")
                .subject("Welcome to Nexus University — Set Your Password")
                .description("Welcome email sent to new lecturers. Placeholders: {firstName}, {email}, {setPasswordUrl}")
                .body(lecturerWelcomeBody())
                .isActive(true)
                .build());
        log.info("Seeded {} email templates", emailTemplateRepository.count());
    }

    private String otpBody() {
        return """
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
    }

    private String lecturerWelcomeBody() {
        return """
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
    }

    private void seedDepartments() {
        Map<String, List<String>> facultyDepts = new LinkedHashMap<>();
        facultyDepts.put("Faculty of Computing and Information Technology", List.of(
            "Computer Science", "Information Technology", "Software Engineering",
            "Information Systems", "Cybersecurity", "Data Science",
            "Artificial Intelligence", "Computer Engineering"
        ));
        facultyDepts.put("Faculty of Business and Management", List.of(
            "Business Administration", "Accounting and Finance", "Marketing",
            "Human Resource Management", "International Business", "Entrepreneurship",
            "Economics", "Banking and Finance"
        ));
        facultyDepts.put("Faculty of Engineering", List.of(
            "Civil Engineering", "Electrical Engineering", "Mechanical Engineering",
            "Chemical Engineering", "Biomedical Engineering", "Environmental Engineering",
            "Telecommunications Engineering", "Petroleum Engineering"
        ));
        facultyDepts.put("Faculty of Medicine and Health Sciences", List.of(
            "Medicine", "Nursing", "Pharmacy", "Public Health",
            "Medical Laboratory Science", "Radiography", "Physiotherapy", "Biomedical Science"
        ));
        facultyDepts.put("Faculty of Law", List.of(
            "Law", "International Law", "Commercial Law", "Criminal Justice"
        ));
        facultyDepts.put("Faculty of Arts and Humanities", List.of(
            "English Literature", "History", "Philosophy", "Religious Studies",
            "Linguistics", "Fine Arts", "Music", "Theatre Arts"
        ));
        facultyDepts.put("Faculty of Natural Sciences", List.of(
            "Mathematics", "Physics", "Chemistry", "Biology", "Geology",
            "Environmental Science", "Statistics", "Biochemistry"
        ));
        facultyDepts.put("Faculty of Social Sciences", List.of(
            "Sociology", "Psychology", "Political Science", "International Relations",
            "Geography", "Anthropology", "Social Work", "Development Studies"
        ));
        facultyDepts.put("Faculty of Education", List.of(
            "Education", "Educational Administration", "Curriculum Studies",
            "Educational Psychology", "Special Education"
        ));
        facultyDepts.put("Faculty of Agriculture and Environmental Sciences", List.of(
            "Agriculture", "Agricultural Economics", "Animal Science",
            "Crop Science", "Soil Science", "Forestry", "Fisheries"
        ));
        facultyDepts.put("Faculty of Architecture and Design", List.of(
            "Architecture", "Urban Planning", "Interior Design",
            "Landscape Architecture", "Graphic Design"
        ));
        facultyDepts.put("Faculty of Journalism and Communication", List.of(
            "Journalism", "Mass Communication", "Public Relations",
            "Advertising", "Digital Media"
        ));
        facultyDepts.put("Faculty of Tourism and Hospitality", List.of(
            "Tourism Management", "Hotel Management", "Event Management",
            "Hospitality Management"
        ));
        facultyDepts.put("Other Specialized Departments", List.of(
            "Veterinary Medicine", "Dentistry", "Optometry", "Sports Science",
            "Military Science", "Aviation", "Maritime Studies"
        ));

        facultyDepts.forEach((faculty, depts) ->
            depts.forEach(name ->
                departmentRepository.save(Department.builder().name(name).faculty(faculty).build())
            )
        );
    }

    private void seedSpecializations() {
        Map<String, List<String>> deptSpecs = Map.ofEntries(
            Map.entry("Computer Science", List.of(
                "Computer Networks", "Database Systems", "Artificial Intelligence",
                "Machine Learning", "Cybersecurity", "Software Development",
                "Web Development", "Mobile Development", "Data Analytics",
                "Cloud Computing", "Blockchain Technology", "Internet of Things",
                "Computer Vision", "Natural Language Processing", "Robotics",
                "Operating Systems", "Computer Architecture", "Parallel Computing"
            )),
            Map.entry("Information Technology", List.of(
                "Network Administration", "Systems Administration", "IT Support",
                "IT Project Management", "Database Administration", "Cloud Infrastructure",
                "DevOps", "IT Security", "Service Desk Management"
            )),
            Map.entry("Software Engineering", List.of(
                "Full Stack Development", "Frontend Development", "Backend Development",
                "Quality Assurance", "Software Testing", "Agile Development",
                "DevOps Engineering", "API Development", "Microservices Architecture"
            )),
            Map.entry("Cybersecurity", List.of(
                "Penetration Testing", "Digital Forensics", "Security Operations",
                "Incident Response", "Risk Assessment", "Compliance and Governance",
                "Malware Analysis", "Network Security", "Application Security"
            )),
            Map.entry("Data Science", List.of(
                "Big Data Analytics", "Statistical Modeling", "Data Mining",
                "Predictive Analytics", "Business Intelligence", "Data Visualization",
                "Deep Learning", "Reinforcement Learning"
            )),
            Map.entry("Artificial Intelligence", List.of(
                "Expert Systems", "Neural Networks", "Computer Graphics",
                "Knowledge Representation", "Automated Reasoning", "Genetic Algorithms",
                "Fuzzy Logic", "Speech Recognition"
            )),
            Map.entry("Business Administration", List.of(
                "Strategic Management", "Operations Management", "Supply Chain Management",
                "Project Management", "Business Analytics", "Change Management",
                "Quality Management", "Risk Management"
            )),
            Map.entry("Accounting and Finance", List.of(
                "Financial Accounting", "Management Accounting", "Auditing",
                "Taxation", "Corporate Finance", "Investment Analysis",
                "Forensic Accounting", "Public Finance"
            )),
            Map.entry("Marketing", List.of(
                "Digital Marketing", "Brand Management", "Market Research",
                "Consumer Behavior", "Advertising Management", "Sales Management",
                "International Marketing", "Social Media Marketing"
            )),
            Map.entry("Human Resource Management", List.of(
                "Talent Acquisition", "Employee Relations", "Compensation and Benefits",
                "Training and Development", "Performance Management", "Organizational Development",
                "Workforce Planning", "Labor Relations"
            )),
            Map.entry("Civil Engineering", List.of(
                "Structural Engineering", "Geotechnical Engineering", "Transportation Engineering",
                "Water Resources Engineering", "Environmental Engineering", "Construction Management",
                "Surveying", "Urban Infrastructure"
            )),
            Map.entry("Electrical Engineering", List.of(
                "Power Systems", "Control Systems", "Electronics",
                "Signal Processing", "Communication Systems", "Embedded Systems",
                "Renewable Energy", "High Voltage Engineering"
            )),
            Map.entry("Mechanical Engineering", List.of(
                "Thermodynamics", "Fluid Mechanics", "Manufacturing Engineering",
                "Automotive Engineering", "Aerospace Engineering", "Robotics",
                "HVAC Systems", "Materials Science"
            )),
            Map.entry("Medicine", List.of(
                "General Medicine", "Surgery", "Pediatrics", "Obstetrics and Gynecology",
                "Cardiology", "Neurology", "Oncology", "Radiology",
                "Dermatology", "Psychiatry", "Orthopedics", "Ophthalmology"
            )),
            Map.entry("Nursing", List.of(
                "Medical-Surgical Nursing", "Pediatric Nursing", "Midwifery",
                "Critical Care Nursing", "Community Health Nursing", "Psychiatric Nursing",
                "Emergency Nursing", "Geriatric Nursing"
            )),
            Map.entry("Pharmacy", List.of(
                "Clinical Pharmacy", "Pharmaceutical Chemistry", "Pharmacology",
                "Pharmacognosy", "Industrial Pharmacy", "Hospital Pharmacy",
                "Community Pharmacy", "Drug Regulatory Affairs"
            )),
            Map.entry("Public Health", List.of(
                "Epidemiology", "Biostatistics", "Health Policy and Management",
                "Environmental Health", "Occupational Health", "Health Education",
                "Maternal and Child Health", "Global Health"
            )),
            Map.entry("Law", List.of(
                "Constitutional Law", "Criminal Law", "Civil Law", "Commercial Law",
                "International Law", "Human Rights Law", "Environmental Law",
                "Intellectual Property Law", "Tax Law", "Labor Law"
            )),
            Map.entry("Mathematics", List.of(
                "Pure Mathematics", "Applied Mathematics", "Mathematical Statistics",
                "Numerical Analysis", "Operations Research", "Cryptography",
                "Mathematical Modeling", "Financial Mathematics"
            )),
            Map.entry("Physics", List.of(
                "Quantum Mechanics", "Thermodynamics", "Electromagnetism",
                "Optics", "Nuclear Physics", "Astrophysics",
                "Particle Physics", "Condensed Matter Physics"
            )),
            Map.entry("Chemistry", List.of(
                "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry",
                "Analytical Chemistry", "Biochemistry", "Polymer Chemistry",
                "Environmental Chemistry", "Industrial Chemistry"
            )),
            Map.entry("Biology", List.of(
                "Molecular Biology", "Cell Biology", "Genetics",
                "Microbiology", "Ecology", "Evolutionary Biology",
                "Immunology", "Neuroscience"
            )),
            Map.entry("Psychology", List.of(
                "Clinical Psychology", "Counseling Psychology", "Educational Psychology",
                "Industrial-Organizational Psychology", "Developmental Psychology",
                "Social Psychology", "Neuropsychology", "Forensic Psychology"
            )),
            Map.entry("Architecture", List.of(
                "Residential Architecture", "Commercial Architecture", "Sustainable Design",
                "Urban Design", "Interior Architecture", "Landscape Design",
                "Heritage Conservation", "Parametric Design"
            )),
            Map.entry("Journalism", List.of(
                "Print Journalism", "Broadcast Journalism", "Digital Journalism",
                "Investigative Journalism", "Sports Journalism", "Photojournalism",
                "Data Journalism", "Environmental Journalism"
            )),
            Map.entry("Education", List.of(
                "Early Childhood Education", "Primary Education", "Secondary Education",
                "Higher Education", "Special Education", "Educational Technology",
                "Language Education", "STEM Education"
            )),
            Map.entry("Agriculture", List.of(
                "Crop Production", "Soil Management", "Plant Pathology",
                "Entomology", "Agricultural Extension", "Irrigation Engineering",
                "Organic Farming", "Precision Agriculture"
            )),
            Map.entry("Tourism Management", List.of(
                "Eco-Tourism", "Cultural Tourism", "Hospitality Operations",
                "Travel Agency Management", "Event Planning", "Destination Marketing",
                "Sustainable Tourism", "Adventure Tourism"
            ))
        );

        deptSpecs.forEach((dept, specs) ->
            specs.forEach(name ->
                specializationRepository.save(Specialization.builder()
                    .name(name)
                    .department(dept)
                    .build())
            )
        );

        // Add cross-cutting specializations without a specific department
        List.of(
            "Project Management", "Research Methodology", "Leadership and Management",
            "Public Administration", "Grant Writing", "Academic Writing",
            "Statistics and Data Analysis", "Entrepreneurship and Innovation",
            "Sustainable Development", "Gender Studies", "Peace and Conflict Studies",
            "Disaster Management", "Climate Change Studies", "Digital Transformation",
            "Smart Systems", "Internet of Things", "Edge Computing",
            "Quantum Computing", "Augmented Reality", "Virtual Reality",
            "Game Development", "UI/UX Design", "Product Management",
            "Technical Writing", "Business Process Reengineering"
        ).forEach(name ->
            specializationRepository.save(Specialization.builder().name(name).build())
        );
    }
}
