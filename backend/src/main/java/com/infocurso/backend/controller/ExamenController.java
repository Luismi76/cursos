package com.infocurso.backend.controller;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.ExamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/curso/{cursoId}/examenes")
@RequiredArgsConstructor
public class ExamenController {

    private final ExamenService examenService;

    // Obtener todos los exámenes del curso
    @GetMapping
    @PreAuthorize("hasAnyRole('ALUMNO', 'PROFESOR', 'ADMINISTRADOR')")
    public List<ExamenDTO> getExamenesCurso(@PathVariable UUID cursoId) {
        return examenService.getExamenesCurso(cursoId);
    }

    // Obtener próximos exámenes
    @GetMapping("/proximos")
    @PreAuthorize("hasAnyRole('ALUMNO', 'PROFESOR', 'ADMINISTRADOR')")
    public List<ExamenDTO> getProximosExamenes(@PathVariable UUID cursoId) {
        return examenService.getProximosExamenes(cursoId);
    }

    // Obtener exámenes pasados
    @GetMapping("/pasados")
    @PreAuthorize("hasAnyRole('ALUMNO', 'PROFESOR', 'ADMINISTRADOR')")
    public List<ExamenDTO> getExamenesPasados(@PathVariable UUID cursoId) {
        return examenService.getExamenesPasados(cursoId);
    }

    // Crear examen (profesor/admin)
    @PostMapping
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<ExamenDTO> crearExamen(
            @PathVariable UUID cursoId,
            @RequestBody CrearExamenDTO dto) {
        return ResponseEntity.ok(examenService.crearExamen(cursoId, dto));
    }

    // Actualizar examen (profesor/admin)
    @PutMapping("/{examenId}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<ExamenDTO> actualizarExamen(
            @PathVariable UUID cursoId,
            @PathVariable UUID examenId,
            @RequestBody CrearExamenDTO dto) {
        return ResponseEntity.ok(examenService.actualizarExamen(examenId, dto));
    }

    // Eliminar examen (profesor/admin)
    @DeleteMapping("/{examenId}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarExamen(
            @PathVariable UUID cursoId,
            @PathVariable UUID examenId) {
        examenService.eliminarExamen(examenId);
        return ResponseEntity.ok().build();
    }

    // Obtener notas de un examen (profesor/admin)
    @GetMapping("/{examenId}/notas")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public List<NotaExamenDTO> getNotasExamen(
            @PathVariable UUID cursoId,
            @PathVariable UUID examenId) {
        return examenService.getNotasExamen(examenId);
    }

    // Obtener mis notas (alumno)
    @GetMapping("/mis-notas")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<NotaExamenDTO> getMisNotas(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario) {
        return examenService.getMisNotasExamenes(usuario.getId(), cursoId);
    }

    // Obtener mi promedio (alumno)
    @GetMapping("/mi-promedio")
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<Double> getMiPromedio(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario) {
        Double promedio = examenService.getPromedioAlumno(usuario.getId(), cursoId);
        return ResponseEntity.ok(promedio != null ? promedio : 0.0);
    }

    // Registrar nota individual (profesor/admin)
    @PostMapping("/{examenId}/notas")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<NotaExamenDTO> registrarNota(
            @PathVariable UUID cursoId,
            @PathVariable UUID examenId,
            @RequestBody RegistrarNotaDTO dto) {
        return ResponseEntity.ok(examenService.registrarNota(examenId, dto));
    }

    // Registrar múltiples notas (profesor/admin)
    @PostMapping("/{examenId}/notas/multiple")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<Void> registrarNotasMultiples(
            @PathVariable UUID cursoId,
            @PathVariable UUID examenId,
            @RequestBody List<RegistrarNotaDTO> notas) {
        examenService.registrarNotasMultiples(examenId, notas);
        return ResponseEntity.ok().build();
    }

    // Eliminar nota (profesor/admin)
    @DeleteMapping("/notas/{notaId}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarNota(
            @PathVariable UUID cursoId,
            @PathVariable UUID notaId) {
        examenService.eliminarNota(notaId);
        return ResponseEntity.ok().build();
    }
}
