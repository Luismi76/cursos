package com.infocurso.backend.dto;

import java.util.List;

public record EstadisticasProfesorDTO(
        int totalCursos,
        int totalAlumnos,
        int entregasPendientes,
        int examenesProximos,
        double asistenciaMedia,
        List<ResumenCursoProfesorDTO> cursos
) {
}
