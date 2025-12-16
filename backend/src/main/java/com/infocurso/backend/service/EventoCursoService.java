package com.infocurso.backend.service;

import com.infocurso.backend.dto.EventoCursoDTO;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.EventoCurso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.EventoCursoRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventoCursoService {

    private final EventoCursoRepository eventoRepo;
    private final CursoRepository cursoRepo;
    private final UsuarioRepository usuarioRepo;

    public EventoCurso crearEvento(EventoCursoDTO dto, UUID cursoId, String autorEmail) {
        Curso curso = cursoRepo.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Usuario autor = usuarioRepo.findByEmail(autorEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        EventoCurso evento = EventoCurso.builder()
                .titulo(dto.titulo())
                .descripcion(dto.descripcion())
                .tipo(dto.tipo())
                .visiblePara(dto.visiblePara())
                .fecha(dto.fecha())
                .curso(curso)
                .autor(autor)
                .build();

        return eventoRepo.save(evento);
    }

    public List<EventoCurso> listarEventosPorCurso(UUID cursoId) {
        return eventoRepo.findByCursoId(cursoId);
    }
}
