package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Examen;
import com.infocurso.backend.entity.TipoExamen;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExamenDTO(
        UUID id,
        String titulo,
        String descripcion,
        UUID cursoId,
        LocalDateTime fecha,
        TipoExamen tipo,
        Double puntuacionMaxima,
        Integer totalNotas,
        Double promedioNotas
) {
    public static ExamenDTO from(Examen examen) {
        return new ExamenDTO(
                examen.getId(),
                examen.getTitulo(),
                examen.getDescripcion(),
                examen.getCurso().getId(),
                examen.getFecha(),
                examen.getTipo(),
                examen.getPuntuacionMaxima(),
                null,
                null
        );
    }

    public static ExamenDTO from(Examen examen, Integer totalNotas, Double promedio) {
        return new ExamenDTO(
                examen.getId(),
                examen.getTitulo(),
                examen.getDescripcion(),
                examen.getCurso().getId(),
                examen.getFecha(),
                examen.getTipo(),
                examen.getPuntuacionMaxima(),
                totalNotas,
                promedio
        );
    }
}
