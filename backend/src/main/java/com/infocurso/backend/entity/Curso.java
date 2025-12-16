package com.infocurso.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue
    private UUID id;

    private String nombre;

    private String descripcion;

    @ManyToOne(optional = true)
    @JsonIgnore // Evita ciclos al serializar
    private Usuario profesor;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Practica> practicas = new HashSet<>();

    @ManyToMany
    @JsonIgnore
    @Builder.Default
    @JoinTable(
            name = "curso_alumnos",
            joinColumns = @JoinColumn(name = "curso_id"),
            inverseJoinColumns = @JoinColumn(name = "alumno_id")
    )
    private Set<Usuario> alumnos = new HashSet<>();

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @OrderColumn(name = "orden_modulo")
    @Builder.Default
    private List<Modulo> modulos = new ArrayList<>();

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @OrderBy("fecha ASC")
    @Builder.Default
    private List<EventoCurso> eventos = new ArrayList<>();

    public void agregarModulo(Modulo modulo) {
        modulos.add(modulo);
        modulo.setCurso(this);
    }

    public void quitarModulo(Modulo modulo) {
        modulos.remove(modulo);
        modulo.setCurso(null);
    }
}
