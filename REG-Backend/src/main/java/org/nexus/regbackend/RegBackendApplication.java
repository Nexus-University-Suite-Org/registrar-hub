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

        Dotenv dotenv = Dotenv.configure()
                .directory("./registrar-hub/REG-Backend")
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue()));
        SpringApplication.run(RegBackendApplication.class, args);
    }

}
