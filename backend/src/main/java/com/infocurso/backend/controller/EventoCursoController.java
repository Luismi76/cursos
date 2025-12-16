package com.infocurso.backend.controller;

import com.infocurso.backend.dto.EventoCursoDTO;
import com.infocurso.backend.entity.EventoCurso;
import com.infocurso.backend.service.EventoCursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoCursoController {

    private final EventoCursoService eventoService;

    @PostMapping("/curso/{cursoId}")
    public ResponseEntity<?> crearEvento(
            @PathVariable UUID cursoId,
            @RequestBody EventoCursoDTO dto,
            @AuthenticationPrincipal UserDetails user
    ) {
        EventoCurso evento = eventoService.crearEvento(dto, cursoId, user.getUsername());
        return ResponseEntity.ok(evento);
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<?> listarEventos(@PathVariable UUID cursoId) {
        return ResponseEntity.ok(eventoService.listarEventosPorCurso(cursoId));
    }
}

