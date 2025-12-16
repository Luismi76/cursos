package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Mensaje;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MensajeDTO {
    private UUID emisorId;
    private String emisorNombre;
    private String emisorAvatarUrl;

    private UUID receptorId;
    private String receptorNombre;
    private String receptorAvatarUrl;

    private String contenido;
    private LocalDateTime fechaEnvio;

    public static MensajeDTO from(Mensaje mensaje) {
        return MensajeDTO.builder()
                .emisorId(mensaje.getEmisor().getId())
                .emisorNombre(mensaje.getEmisor().getNombre())
                .emisorAvatarUrl(mensaje.getEmisor().getAvatarUrl())

                .receptorId(mensaje.getReceptor().getId())
                .receptorNombre(mensaje.getReceptor().getNombre())
                .receptorAvatarUrl(mensaje.getReceptor().getAvatarUrl())

                .contenido(mensaje.getContenido())
                .fechaEnvio(mensaje.getFechaEnvio())
                .build();
    }
}
