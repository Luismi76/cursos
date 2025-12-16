package com.infocurso.backend.dto;

import com.infocurso.backend.entity.EstadoAsistencia;

import java.time.LocalDate;
import java.util.UUID;

public record RegistroAsistenciaDTO(
        UUID alumnoId,
        LocalDate fecha,
        EstadoAsistencia estado,
        String observaciones
) {
}
