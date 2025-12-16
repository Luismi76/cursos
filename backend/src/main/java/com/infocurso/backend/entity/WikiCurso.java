package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WikiCurso {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne
    private Curso curso;

    @Column(columnDefinition = "TEXT")
    private String contenido;

}

