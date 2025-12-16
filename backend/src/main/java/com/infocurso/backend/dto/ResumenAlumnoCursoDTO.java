package com.infocurso.backend.dto;

import java.util.UUID;

public record ResumenAlumnoCursoDTO(
        UUID alumnoId,
        String alumnoNombre,
        String alumnoEmail,
        Double notaPracticas,
        Integer practicasCalificadas,
        Double notaExamenes,
        Integer examenesCalificados,
        Double porcentajeAsistencia,
        Double notaFinal
) {
}
