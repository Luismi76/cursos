package com.infocurso.backend.dto;

import com.infocurso.backend.entity.MensajeCurso;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MensajeCursoDTO {
    private UUID id;
    private UUID cursoId;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private AutorDTO autor;

    @Data
    @Builder
    public static class AutorDTO {
        private UUID id;
        private String nombre;
        private String avatarUrl;
    }

    public static MensajeCursoDTO from(MensajeCurso mensaje) {
        return new MensajeCursoDTO(
                mensaje.getId(),
                mensaje.getCurso().getId(),
                mensaje.getContenido(),
                mensaje.getFechaEnvio(),
                AutorDTO.builder()
                        .id(mensaje.getEmisor().getId())
                        .nombre(mensaje.getEmisor().getNombre())
                        .avatarUrl(mensaje.getEmisor().getAvatarUrl())
                        .build()
        );
    }

    public MensajeCursoDTO(UUID id, UUID cursoId, String contenido, LocalDateTime fechaEnvio, AutorDTO autor) {
        this.id = id;
        this.cursoId = cursoId;
        this.contenido = contenido;
        this.fechaEnvio = fechaEnvio;
        this.autor = autor;
    }
}
