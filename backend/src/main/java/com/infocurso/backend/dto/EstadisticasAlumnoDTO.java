package com.infocurso.backend.dto;

import java.util.List;

public record EstadisticasAlumnoDTO(
        int totalCursos,
        int totalPracticasEntregadas,
        int totalPracticasPendientes,
        Double promedioGeneral,
        Double porcentajeAsistenciaGlobal,
        int totalExamenesPendientes,
        List<ResumenCursoAlumnoDTO> cursos
) {
    public record ResumenCursoAlumnoDTO(
            String cursoId,
            String cursoNombre,
            Double notaActual,
            Integer practicasEntregadas,
            Integer practicasPendientes,
            Double porcentajeAsistencia,
            Integer examenesRealizados,
            Integer examenesPendientes
    ) {}
}
