package com.infocurso.backend.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import jakarta.annotation.PostConstruct;

@Configuration
public class JacksonConfig {

    private final Jackson2ObjectMapperBuilder builder;

    public JacksonConfig(Jackson2ObjectMapperBuilder builder) {
        this.builder = builder;
    }

    @PostConstruct
    public void customizeJackson() {
        builder.modulesToInstall(new JavaTimeModule());
        builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
