package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EntregaPractica {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private Practica practica;

    @ManyToOne(optional = false)
    private Usuario alumno;

    private String comentario;

    private String archivoUrl;

    private LocalDateTime fechaEntrega;

    private Double nota;

    @Column(length = 1000)
    private String comentarioProfesor;

    private LocalDateTime fechaCalificacion; // 👈 NUEVO CAMPO
}
