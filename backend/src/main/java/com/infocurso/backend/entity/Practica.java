package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Practica {

    @Id
    @GeneratedValue
    private UUID id;

    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    private LocalDateTime fechaEntrega; // ← Cambiado a LocalDateTime

    @ManyToOne(optional = false)
    private Curso curso;
}
