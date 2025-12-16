package com.infocurso.backend.dto;

import com.infocurso.backend.entity.MensajeCurso;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeCursoVistaDTO {

    private UUID id;
    private String contenido;
    private String fechaEnvio;
    private AutorDTO autor;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AutorDTO {
        private UUID id;
        private String nombre;
    }

    public static MensajeCursoVistaDTO from(MensajeCurso mensaje) {
        return MensajeCursoVistaDTO.builder()
                .id(mensaje.getId())
                .contenido(mensaje.getContenido())
                .fechaEnvio(mensaje.getFechaEnvio().toString())
                .autor(
                        AutorDTO.builder()
                                .id(mensaje.getEmisor().getId())
                                .nombre(mensaje.getEmisor().getNombre())
                                .build()
                )
                .build();
    }
}

