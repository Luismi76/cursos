package com.infocurso.backend.dto;

import com.infocurso.backend.entity.TipoExamen;

import java.time.LocalDateTime;

public record CrearExamenDTO(
        String titulo,
        String descripcion,
        LocalDateTime fecha,
        TipoExamen tipo,
        Double puntuacionMaxima
) {
}
