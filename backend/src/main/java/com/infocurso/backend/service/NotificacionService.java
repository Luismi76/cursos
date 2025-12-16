package com.infocurso.backend.service;

import com.infocurso.backend.dto.NotificacionDTO;
import com.infocurso.backend.entity.Notificacion;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public void enviar(Usuario usuario, String mensaje, String tipo) {
        Notificacion n = Notificacion.builder()
                .usuario(usuario)
                .mensaje(mensaje)
                .fecha(LocalDateTime.now())
                .tipo(tipo)
                .leida(false)
                .build();

        notificacionRepository.save(n);

        // Enviar por WebSocket
        NotificacionDTO dto = NotificacionDTO.from(n);
        messagingTemplate.convertAndSendToUser(
                usuario.getEmail(),
                "/queue/notifications",
                dto);
    }

    public List<NotificacionDTO> getNotificacionesDeUsuario(UUID usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuarioId)
                .stream()
                .map(NotificacionDTO::from)
                .toList();
    }

    public void marcarComoLeida(UUID notificacionId, UUID usuarioId) {
        Notificacion noti = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        if (!noti.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No autorizado");
        }

        noti.setLeida(true);
        notificacionRepository.save(noti);
    }

}
