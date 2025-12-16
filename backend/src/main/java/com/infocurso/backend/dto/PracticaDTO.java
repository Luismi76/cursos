package com.infocurso.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.infocurso.backend.entity.Practica;
import jakarta.persistence.Lob;

import java.time.LocalDateTime;
import java.util.UUID;

public record PracticaDTO(
        UUID id,
        String titulo,
        @Lob
        String descripcion,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime fechaEntrega
) {
    public static PracticaDTO from(Practica practica) {
        return new PracticaDTO(
                practica.getId(),
                practica.getTitulo(),
                practica.getDescripcion(),
                practica.getFechaEntrega()
        );
    }
}
