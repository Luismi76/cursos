package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Notificacion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificacionDTO {
    private UUID id;
    private String mensaje;
    private String tipo;
    private boolean leida;
    private LocalDateTime fecha;

    public static NotificacionDTO from(Notificacion n) {
        return new NotificacionDTO(
                n.getId(),
                n.getMensaje(),
                n.getTipo(),
                n.isLeida(),
                n.getFecha()
        );
    }
}

