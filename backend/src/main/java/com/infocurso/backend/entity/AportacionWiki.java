package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AportacionWiki {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    private WikiCurso wiki;

    @ManyToOne
    private Usuario autor;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    private LocalDateTime fecha;
}

