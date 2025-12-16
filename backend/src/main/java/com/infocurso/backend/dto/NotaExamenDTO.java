package com.infocurso.backend.dto;

import com.infocurso.backend.entity.NotaExamen;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotaExamenDTO(
        UUID id,
        UUID examenId,
        String examenTitulo,
        UUID alumnoId,
        String alumnoNombre,
        Double nota,
        Double puntuacionMaxima,
        String observaciones,
        LocalDateTime fechaCalificacion
) {
    public static NotaExamenDTO from(NotaExamen notaExamen) {
        return new NotaExamenDTO(
                notaExamen.getId(),
                notaExamen.getExamen().getId(),
                notaExamen.getExamen().getTitulo(),
                notaExamen.getAlumno().getId(),
                notaExamen.getAlumno().getNombre(),
                notaExamen.getNota(),
                notaExamen.getExamen().getPuntuacionMaxima(),
                notaExamen.getObservaciones(),
                notaExamen.getFechaCalificacion()
        );
    }
}
