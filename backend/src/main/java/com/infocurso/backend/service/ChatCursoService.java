package com.infocurso.backend.service;

import com.infocurso.backend.entity.MensajeCurso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.MensajeCursoRepository;
import com.infocurso.backend.repository.MensajeCursoLeidoRepository;
import com.infocurso.backend.entity.MensajeCursoLeido;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatCursoService {

    private final MensajeCursoLeidoRepository leidoRepository;
    private final MensajeCursoRepository mensajeCursoRepository;
    private final CursoRepository cursoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<UUID> marcarMensajesComoLeidos(UUID cursoId, UUID usuarioId) {
        var leidoOpt = leidoRepository.findByCursoIdAndUsuarioId(cursoId, usuarioId);
        UUID ultimoLeidoId = leidoOpt.map(MensajeCursoLeido::getUltimoMensajeLeidoId).orElse(null);

        // Obtener mensajes no leídos antes de marcar
        List<MensajeCurso> mensajesNoLeidos;
        if (ultimoLeidoId == null) {
            mensajesNoLeidos = mensajeCursoRepository.findByCursoIdAndEmisorIdNot(cursoId, usuarioId);
        } else {
            var ultimoMensajeLeido = mensajeCursoRepository.findById(ultimoLeidoId);
            if (ultimoMensajeLeido.isEmpty()) {
                mensajesNoLeidos = List.of();
            } else {
                var fechaUltimoLeido = ultimoMensajeLeido.get().getFechaEnvio();
                mensajesNoLeidos = mensajeCursoRepository
                        .findByCursoIdAndFechaEnvioAfterAndEmisorIdNot(cursoId, fechaUltimoLeido, usuarioId);
            }
        }

        List<UUID> idsLeidos = mensajesNoLeidos.stream()
                .map(MensajeCurso::getId)
                .toList();

        // Marcar como leído
        var ultimoMensaje = mensajeCursoRepository.findTopByCursoIdOrderByFechaEnvioDesc(cursoId);
        if (ultimoMensaje.isPresent()) {
            MensajeCursoLeido leido = leidoOpt
                    .orElseGet(() -> MensajeCursoLeido.builder()
                            .cursoId(cursoId)
                            .usuarioId(usuarioId)
                            .build());

            leido.setUltimoMensajeLeidoId(ultimoMensaje.get().getId());
            leidoRepository.save(leido);
        }

        return idsLeidos;
    }

    public int getNumeroMensajesNoLeidos(UUID cursoId, UUID usuarioId) {
        var leidoOpt = leidoRepository.findByCursoIdAndUsuarioId(cursoId, usuarioId);

        UUID ultimoLeidoId = leidoOpt.map(MensajeCursoLeido::getUltimoMensajeLeidoId).orElse(null);

        // Si nunca ha leído ningún mensaje, contar todos excepto los suyos
        if (ultimoLeidoId == null) {
            return mensajeCursoRepository.countByCursoIdAndEmisorIdNot(cursoId, usuarioId);
        }

        // Buscar la fecha del último mensaje leído
        var ultimoMensajeLeido = mensajeCursoRepository.findById(ultimoLeidoId);
        if (ultimoMensajeLeido.isEmpty())
            return 0;

        var fechaUltimoLeido = ultimoMensajeLeido.get().getFechaEnvio();

        return mensajeCursoRepository.countByCursoIdAndFechaEnvioAfterAndEmisorIdNot(
                cursoId, fechaUltimoLeido, usuarioId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void enviarMensajeCurso(UUID cursoId, Usuario usuario, String contenido) {
        MensajeCurso mensaje = MensajeCurso.builder()
                .curso(cursoRepository.getReferenceById(cursoId))
                .emisor(usuario)
                .contenido(contenido)
                .fechaEnvio(LocalDateTime.now())
                .build();
        mensajeCursoRepository.save(mensaje);

        // Broadcast el mensaje a todos los suscriptores del curso
        messagingTemplate.convertAndSend(
                "/topic/curso/" + cursoId,
                com.infocurso.backend.dto.MensajeCursoDTO.from(mensaje));
    }

}
