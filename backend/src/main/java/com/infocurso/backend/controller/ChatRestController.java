package com.infocurso.backend.controller;

import com.infocurso.backend.dto.MensajeCursoDTO;
import com.infocurso.backend.dto.MensajeCursoVistaDTO;
import com.infocurso.backend.dto.MensajeDTO;
import com.infocurso.backend.entity.Mensaje;
import com.infocurso.backend.entity.MensajeCurso;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.MensajeCursoRepository;
import com.infocurso.backend.repository.MensajeRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatRestController {

    private final MensajeRepository mensajeRepository;
    private final MensajeCursoRepository mensajeCursoRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;

    // Conversación privada entre dos usuarios
    @GetMapping("/privado/{user1}/{user2}")
    public List<MensajeDTO> getConversacion(@PathVariable UUID user1, @PathVariable UUID user2) {
        return mensajeRepository.obtenerConversacion(user1, user2)
                .stream()
                .map(MensajeDTO::from)
                .toList();
    }

    @GetMapping("/curso/{cursoId}")
    public List<MensajeCursoVistaDTO> obtenerMensajes(@PathVariable UUID cursoId) {
        return mensajeCursoRepository.findAllByCursoIdOrderByFechaEnvioAsc(cursoId)
                .stream()
                .map(MensajeCursoVistaDTO::from)
                .toList();
    }

    @MessageMapping("/curso-chat")
    @Transactional
    public void enviarMensajeCurso(@Payload MensajeCursoDTO dto) {
        System.out.println("🎯 MÉTODO INVOCADO - enviarMensajeCurso");
        System.out.println("📨 Mensaje recibido en backend: " + dto);
        System.out.println("  - CursoId: " + dto.getCursoId());
        System.out.println("  - Autor: " + dto.getAutor());
        System.out.println("  - Contenido: " + dto.getContenido());

        try {
            MensajeCurso mensaje = MensajeCurso.builder()
                    .curso(cursoRepository.getReferenceById(dto.getCursoId()))
                    .emisor(usuarioRepository.getReferenceById(dto.getAutor().getId()))
                    .contenido(dto.getContenido())
                    .fechaEnvio(LocalDateTime.now())
                    .build();

            mensajeCursoRepository.save(mensaje);
            System.out.println("✅ Mensaje guardado en BD");

            MensajeCursoDTO dtoEnriquecido = MensajeCursoDTO.from(mensaje);
            System.out.println("📤 Broadcasting mensaje a: /topic/curso/" + dto.getCursoId());

            messagingTemplate.convertAndSend(
                    "/topic/curso/" + dto.getCursoId(),
                    dtoEnriquecido);
            System.out.println("✅ Mensaje enviado por WebSocket");
        } catch (Exception e) {
            System.err.println("❌ Error procesando mensaje: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
