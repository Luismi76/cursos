package com.infocurso.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/uploads/avatars/**").permitAll()
                        .requestMatchers("/ws-chat/**").permitAll()
                        .requestMatchers("/api/chat/**").hasAnyRole("ALUMNO", "PROFESOR", "ADMINISTRADOR")
                        .requestMatchers("/api/usuarios/**").hasAnyRole("ALUMNO", "PROFESOR", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.GET, "/api/wiki/**").permitAll()
                        .requestMatchers("/archivos/**").permitAll()
                        .requestMatchers("/api/alumno/**").hasRole("ALUMNO")
                        .requestMatchers("/api/profesor/**").hasRole("PROFESOR")
                        .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("/api/practicas/**").hasRole("ALUMNO")
                        .requestMatchers("/api/cursos/**").hasAnyRole("ALUMNO", "PROFESOR", "ADMINISTRADOR")
                        .requestMatchers("/api/curso/**").hasAnyRole("ALUMNO", "PROFESOR", "ADMINISTRADOR")
                        .requestMatchers("/api/chat-curso/**").hasAnyRole("ALUMNO", "PROFESOR", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.POST, "/api/wiki/**").hasAnyRole("ALUMNO", "PROFESOR")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
