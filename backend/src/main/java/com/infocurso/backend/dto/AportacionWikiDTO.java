package com.infocurso.backend.dto;

import com.infocurso.backend.entity.AportacionWiki;

import java.time.LocalDateTime;
import java.util.UUID;

public record AportacionWikiDTO(
        UUID id,
        UsuarioDTO autor,
        String contenido,
        LocalDateTime fecha
) {
    public static AportacionWikiDTO from(AportacionWiki a) {
        return new AportacionWikiDTO(
                a.getId(),
                UsuarioDTO.from(a.getAutor()),
                a.getContenido(),
                a.getFecha()
        );
    }
}

