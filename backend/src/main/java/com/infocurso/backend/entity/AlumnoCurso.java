package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AlumnoCurso {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private Usuario alumno;

    @ManyToOne(optional = false)
    private Curso curso;
}
