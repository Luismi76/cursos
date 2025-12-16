package com.infocurso.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatMessage {
    private UUID emisorId;
    private String emisorNombre;
    private String emisorAvatarUrl;

    private UUID receptorId;
    private String receptorNombre;
    private String receptorAvatarUrl;

    private String contenido;
    private LocalDateTime fechaEnvio;
}
