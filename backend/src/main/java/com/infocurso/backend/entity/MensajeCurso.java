package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // ✅ ESTA ES LA ANOTACIÓN NECESARIA
public class MensajeCurso {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    private Curso curso;

    @ManyToOne(fetch = FetchType.EAGER)
    private Usuario emisor;

    private String contenido;

    private LocalDateTime fechaEnvio;
}

