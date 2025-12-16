package com.infocurso.backend.controller;

import com.infocurso.backend.dto.AportacionWikiDTO;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.UsuarioService;
import com.infocurso.backend.service.WikiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wiki")
@RequiredArgsConstructor
public class WikiController {

    private final WikiService wikiService;
    private final UsuarioService usuarioService;

    @GetMapping("/{cursoId}")
    public String getContenido(@PathVariable UUID cursoId) {
        return wikiService.getContenidoWiki(cursoId);
    }

    @PostMapping("/{cursoId}")
    public void actualizarContenido(@PathVariable UUID cursoId, @RequestBody String html) {
        wikiService.actualizarContenidoWiki(cursoId, html);
    }

    @GetMapping("/{cursoId}/aportaciones")
    public List<AportacionWikiDTO> getAportaciones(@PathVariable UUID cursoId) {
        return wikiService.getAportaciones(cursoId);
    }

    @PostMapping("/{cursoId}/aportaciones")
    public void crearAportacion(@PathVariable UUID cursoId,
                                @RequestBody String texto,
                                Authentication authentication) {

        String email = authentication.getName(); // email del usuario autenticado
        Usuario usuario = usuarioService.getByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        wikiService.crearAportacion(cursoId, usuario.getId(), texto);
    }

    @PutMapping("/{cursoId}")
    public void actualizarContenidoPut(@PathVariable UUID cursoId, @RequestBody String html) {
        wikiService.actualizarContenidoWiki(cursoId, html);
    }

}

