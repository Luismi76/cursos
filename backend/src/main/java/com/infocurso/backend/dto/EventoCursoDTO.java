package com.infocurso.backend.dto;

import com.infocurso.backend.entity.EventoCurso;
import com.infocurso.backend.entity.TipoEvento;
import com.infocurso.backend.entity.VisibilidadEvento;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record EventoCursoDTO(
        String titulo,
        String descripcion,
        TipoEvento tipo,
        VisibilidadEvento visiblePara,
        LocalDate fecha
) {
    public static EventoCursoDTO from(EventoCurso evento) {
        return new EventoCursoDTO(
                evento.getTitulo(),
                evento.getDescripcion(),
                evento.getTipo(),
                evento.getVisiblePara(),
                evento.getFecha()
        );
    }
}
