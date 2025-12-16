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
@Builder
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"examen_id", "alumno_id"})
})
public class NotaExamen {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private Examen examen;

    @ManyToOne(optional = false)
    private Usuario alumno;

    private Double nota;

    private String observaciones;

    @Builder.Default
    private LocalDateTime fechaCalificacion = LocalDateTime.now();
}
