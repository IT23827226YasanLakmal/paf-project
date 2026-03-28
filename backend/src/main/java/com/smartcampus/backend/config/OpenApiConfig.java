package com.smartcampus.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartCampusOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Smart Campus Hub API")
                        .description("API documentation for the Smart Campus Hub Operations application.")
                        .version("v1.0.0")
                        .contact(new Contact().name("Backend Team")));
    }
}
