package com.infocurso.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeCursoLeido {
    @Id
    @GeneratedValue
    private UUID id;

    private UUID cursoId;
    private UUID usuarioId;
    private UUID ultimoMensajeLeidoId;
}

