package org.nexus.regbackend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.nexus.regbackend.configuration.JwtProperties;
import org.nexus.regbackend.configuration.OtpProperties;

@SpringBootApplication
@EnableConfigurationProperties({OtpProperties.class, JwtProperties.class})
public class RegBackendApplication {



    public static void main(String[] args) {

        // Resolve the .env location relative to the compiled class output directory,
        // which is always inside REG-Backend/target — so two levels up is the project root.
        String projectRoot = resolveProjectRoot();

        Dotenv dotenv = Dotenv.configure()
                .directory(projectRoot)
                .filename(".env")
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue()));
        SpringApplication.run(RegBackendApplication.class, args);
    }

    /**
     * Returns the REG-Backend project directory regardless of the working directory
     * by walking up from the location of this compiled class.
     */
    private static String resolveProjectRoot() {
        try {
            // RegBackendApplication.class is in target/classes/...
            // Two getParent() calls go from target/classes → target → project root
            java.net.URL location = RegBackendApplication.class
                    .getProtectionDomain().getCodeSource().getLocation();
            java.io.File classesDir = new java.io.File(location.toURI());
            return classesDir.getParentFile().getParentFile().getAbsolutePath();
        } catch (Exception e) {
            // Safe fallback to working directory
            return ".";
        }
    }

}
