package com.infocurso.backend.dto;

import java.util.UUID;

public record EstadisticasAsistenciaDTO(
        UUID alumnoId,
        String alumnoNombre,
        long totalClases,
        long presentes,
        long ausentes,
        long retrasos,
        long justificados,
        double porcentajeAsistencia
) {
}
