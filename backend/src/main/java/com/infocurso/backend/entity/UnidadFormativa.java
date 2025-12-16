package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data // <-- Añade esta anotación para tener getters, setters, equals, hashCode y toString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadFormativa {
    @Id
    @GeneratedValue
    private UUID id;

    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @ManyToOne
    private Modulo modulo;

    @Column(name = "orden_unidad")
    private Integer ordenUnidad;

}