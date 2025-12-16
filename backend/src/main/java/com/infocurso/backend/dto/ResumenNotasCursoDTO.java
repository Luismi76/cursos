package com.infocurso.backend.dto;

import java.util.UUID;

public record ResumenNotasCursoDTO(
        UUID cursoId,
        String cursoNombre,
        Double notaPracticas,
        Integer practicasCalificadas,
        Double notaExamenes,
        Integer examenesCalificados,
        Double porcentajeAsistencia,
        Double notaFinal
) {
}
