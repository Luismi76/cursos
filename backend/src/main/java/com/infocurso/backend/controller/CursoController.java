package com.infocurso.backend.controller;

import com.infocurso.backend.dto.CursoDTO;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.service.CursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ALUMNO', 'PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<?> obtenerCurso(@PathVariable UUID id) {
        CursoDTO dto = cursoService.getCursoDTO(id);
        return ResponseEntity.ok(dto);

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESOR')")
    public void eliminarCurso(@PathVariable UUID id) {
        cursoService.eliminarCurso(id);
    }
}
