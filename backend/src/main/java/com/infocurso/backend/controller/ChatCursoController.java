package com.infocurso.backend.controller;

import com.infocurso.backend.dto.MensajeCursoDTO;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.MensajeCursoRepository;
import com.infocurso.backend.service.ChatCursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat-curso")
@RequiredArgsConstructor
public class ChatCursoController {

    private final ChatCursoService chatCursoService;
    private final MensajeCursoRepository mensajeCursoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ✅ Marcar mensajes como leídos (con broadcast de read receipts)
    @PostMapping("/{cursoId}/leidos")
    public void marcarMensajesComoLeidos(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario) {
        List<UUID> mensajesLeidos = chatCursoService.marcarMensajesComoLeidos(cursoId, usuario.getId());

        // Broadcast read receipts a todos los usuarios del curso
        messagingTemplate.convertAndSend(
                "/topic/curso/" + cursoId + "/read-receipts",
                Map.of(
                        "userId", usuario.getId().toString(),
                        "userName", usuario.getNombre(),
                        "messageIds", mensajesLeidos));
    }

    // ✅ Obtener número de mensajes no leídos
    @GetMapping("/{cursoId}/no-leidos")
    public int getMensajesNoLeidos(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario) {
        return chatCursoService.getNumeroMensajesNoLeidos(cursoId, usuario.getId());
    }

    @PostMapping("/{cursoId}")
    public void enviarMensaje(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario,
            @RequestBody Map<String, String> body) {
        String contenido = body.get("contenido");
        chatCursoService.enviarMensajeCurso(cursoId, usuario, contenido);
    }

    @GetMapping("/{cursoId}")
    public List<MensajeCursoDTO> getMensajes(@PathVariable UUID cursoId) {
        return mensajeCursoRepository.findAllByCursoIdOrderByFechaEnvioAsc(cursoId)
                .stream()
                .map(MensajeCursoDTO::from)
                .toList();
    }

    // ✅ WebSocket: Typing indicators
    @MessageMapping("/chat-curso/{cursoId}/typing")
    public void handleTyping(
            @DestinationVariable UUID cursoId,
            @Payload Map<String, Object> payload,
            Principal principal) {
        String userId = payload.get("userId").toString();
        boolean isTyping = (boolean) payload.get("isTyping");
        String userName = payload.getOrDefault("userName", principal.getName()).toString();

        // Broadcast a todos los usuarios del curso
        messagingTemplate.convertAndSend(
                "/topic/curso/" + cursoId + "/typing",
                Map.of(
                        "userId", userId,
                        "userName", userName,
                        "isTyping", isTyping));
    }
}
