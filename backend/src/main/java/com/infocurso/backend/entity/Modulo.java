package com.infocurso.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modulo {

    @Id
    @GeneratedValue
    private UUID id;

    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @ManyToOne
    private Curso curso;

    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "orden_unidad")
    @Builder.Default
    private List<UnidadFormativa> unidades = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Modulo modulo)) return false;
        return id != null && id.equals(modulo.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
