package com.infocurso.backend.controller;

import com.infocurso.backend.dto.ResumenNotasCursoDTO;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.NotasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notas")
@RequiredArgsConstructor
public class NotasController {

    private final NotasService notasService;

    @GetMapping("/mis-notas")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<ResumenNotasCursoDTO> getMisNotas(@AuthenticationPrincipal Usuario usuario) {
        return notasService.getResumenNotasAlumno(usuario.getId());
    }

    @GetMapping("/mis-notas/curso/{cursoId}")
    @PreAuthorize("hasRole('ALUMNO')")
    public ResumenNotasCursoDTO getMisNotasCurso(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable UUID cursoId) {
        return notasService.getResumenNotasCurso(usuario.getId(), cursoId);
    }

    @GetMapping("/promedio-general")
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<Double> getPromedioGeneral(@AuthenticationPrincipal Usuario usuario) {
        List<ResumenNotasCursoDTO> notas = notasService.getResumenNotasAlumno(usuario.getId());

        if (notas.isEmpty()) {
            return ResponseEntity.ok(0.0);
        }

        double suma = 0;
        int count = 0;
        for (ResumenNotasCursoDTO n : notas) {
            if (n.notaFinal() != null) {
                suma += n.notaFinal();
                count++;
            }
        }

        double promedio = count > 0 ? suma / count : 0;
        return ResponseEntity.ok(Math.round(promedio * 100.0) / 100.0);
    }
}
