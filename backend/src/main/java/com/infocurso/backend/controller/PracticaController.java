package com.infocurso.backend.controller;

import com.infocurso.backend.entity.Practica;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.PracticaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PracticaController {

    private final PracticaService practicaService;

    @PostMapping("/practicas")
    public Practica crearPractica(@RequestBody Map<String, String> body, @AuthenticationPrincipal Usuario profesor) {
        UUID cursoId = UUID.fromString(body.get("cursoId"));
        String titulo = body.get("titulo");
        String descripcion = body.get("descripcion");

        LocalDateTime fechaEntrega = LocalDateTime.parse(body.get("fechaEntrega"), DateTimeFormatter.ISO_DATE_TIME);

        return practicaService.crearPractica(cursoId, titulo, descripcion, fechaEntrega);
    }

    @GetMapping("/cursos/{cursoId}/practicas")
    public List<Practica> listarPracticasPorCurso(@PathVariable UUID cursoId) {
        return practicaService.listarPorCurso(cursoId);
    }

    @GetMapping("/practicas/{id}")
    @PreAuthorize("hasRole('ALUMNO')")
    public Practica getPractica(@PathVariable UUID id) {
        return practicaService.getById(id);
    }
}

