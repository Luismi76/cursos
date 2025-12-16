package com.infocurso.backend.dto;

import java.util.UUID;

public record ResumenCursoProfesorDTO(
        UUID cursoId,
        String cursoNombre,
        int totalAlumnos,
        int entregasPendientes,
        int examenesProximos,
        double asistenciaMedia,
        double promedioNotas
) {
}
