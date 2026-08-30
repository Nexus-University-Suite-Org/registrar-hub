package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.model.Department;
import org.nexus.regbackend.model.Specialization;
import org.nexus.regbackend.repository.DepartmentRepository;
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

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            seedDepartments();
            seedSpecializations();
            log.info("Seeded {} departments and {} specializations",
                    departmentRepository.count(), specializationRepository.count());
        }
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
