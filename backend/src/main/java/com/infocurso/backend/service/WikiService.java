package com.infocurso.backend.service;

import com.infocurso.backend.dto.AportacionWikiDTO;
import com.infocurso.backend.entity.AportacionWiki;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.entity.WikiCurso;
import com.infocurso.backend.repository.AportacionWikiRepository;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import com.infocurso.backend.repository.WikiCursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WikiService {

    private final WikiCursoRepository wikiRepo;
    private final AportacionWikiRepository aportacionRepo;
    private final CursoRepository cursoRepo;
    private final UsuarioRepository usuarioRepo;

    public String getContenidoWiki(UUID cursoId) {
        return wikiRepo.findByCursoId(cursoId)
                .map(WikiCurso::getContenido)
                .orElse("<p>Esta wiki aún no tiene contenido.</p>");
    }

    public void actualizarContenidoWiki(UUID cursoId, String html) {
        WikiCurso wiki = wikiRepo.findByCursoId(cursoId)
                .orElseGet(() -> WikiCurso.builder()
                        .curso(cursoRepo.findById(cursoId).orElseThrow())
                        .build());
        wiki.setContenido(html);
        wikiRepo.save(wiki);
    }

    public void crearAportacion(UUID cursoId, UUID autorId, String texto) {
        // Obtener o crear la wiki del curso
        WikiCurso wiki = wikiRepo.findByCursoId(cursoId)
                .orElseGet(() -> {
                    Curso curso = cursoRepo.findById(cursoId)
                            .orElseThrow(() -> new RuntimeException("Curso no encontrado con ID: " + cursoId));
                    WikiCurso nuevaWiki = WikiCurso.builder()
                            .curso(curso)
                            .build();
                    return wikiRepo.save(nuevaWiki);
                });

        // Obtener el autor
        Usuario autor = usuarioRepo.findById(autorId)
                .orElseThrow(() -> new RuntimeException("Usuario autor no encontrado con ID: " + autorId));

        // Crear la aportación
        AportacionWiki aportacion = AportacionWiki.builder()
                .wiki(wiki)
                .autor(autor)
                .contenido(texto)
                .fecha(LocalDateTime.now())
                .build();

        // Guardar la aportación
        aportacionRepo.save(aportacion);
    }



    public List<AportacionWikiDTO> getAportaciones(UUID cursoId) {
        return aportacionRepo.findByWikiCursoIdOrderByFechaDesc(cursoId)
                .stream()
                .map(AportacionWikiDTO::from)
                .toList();
    }
}

