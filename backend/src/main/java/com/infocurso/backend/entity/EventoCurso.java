package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoCurso {
    @Id
    @GeneratedValue
    private UUID id;

    private String titulo;
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private TipoEvento tipo;

    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    private VisibilidadEvento visiblePara;

    @ManyToOne
    private Curso curso;

    @ManyToOne
    private Usuario autor; // Puede ser admin o profesor
}
