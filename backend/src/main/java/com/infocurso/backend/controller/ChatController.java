package com.infocurso.backend.controller;

import com.infocurso.backend.dto.ChatMessage;
import com.infocurso.backend.entity.Mensaje;
import com.infocurso.backend.repository.MensajeRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UsuarioRepository usuarioRepository;
    private final MensajeRepository mensajeRepository;

    @MessageMapping("/chat")
    public void enviar(ChatMessage msg) {
        var emisor = usuarioRepository.getReferenceById(msg.getEmisorId());
        var receptor = usuarioRepository.getReferenceById(msg.getReceptorId());

        Mensaje nuevo = Mensaje.builder()
                .emisor(emisor)
                .receptor(receptor)
                .contenido(msg.getContenido())
                .fechaEnvio(LocalDateTime.now())
                .build();

        mensajeRepository.save(nuevo);

        msg.setEmisorNombre(emisor.getNombre());
        msg.setEmisorAvatarUrl(emisor.getAvatarUrl());

        msg.setReceptorNombre(receptor.getNombre());
        msg.setReceptorAvatarUrl(receptor.getAvatarUrl());

        msg.setFechaEnvio(nuevo.getFechaEnvio());

        messagingTemplate.convertAndSendToUser(
                receptor.getId().toString(),
                "/queue/messages",
                msg
        );
    }

}

