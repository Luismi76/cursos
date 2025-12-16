package com.infocurso.backend.dto;

public record EstadisticasSistemaDTO(
        int totalUsuarios,
        int totalAlumnos,
        int totalProfesores,
        int totalAdministradores,
        int totalCursos,
        int cursosActivos,
        int totalPracticas,
        int totalExamenes,
        int entregasTotales,
        int entregasPendientes,
        double asistenciaMedia
) {
}
