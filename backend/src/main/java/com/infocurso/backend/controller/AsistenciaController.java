package com.infocurso.backend.controller;

import com.infocurso.backend.dto.AsistenciaDTO;
import com.infocurso.backend.dto.EstadisticasAsistenciaDTO;
import com.infocurso.backend.dto.RegistroAsistenciaDTO;
import com.infocurso.backend.entity.EstadoAsistencia;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.AsistenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/curso/{cursoId}/asistencia")
@RequiredArgsConstructor
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public List<AsistenciaDTO> getAsistenciaCurso(@PathVariable UUID cursoId) {
        return asistenciaService.getAsistenciaCurso(cursoId);
    }

    @GetMapping("/fecha/{fecha}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public List<AsistenciaDTO> getAsistenciaPorFecha(
            @PathVariable UUID cursoId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return asistenciaService.getAsistenciaCursoByFecha(cursoId, fecha);
    }

    @GetMapping("/fechas")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public List<LocalDate> getFechasConAsistencia(@PathVariable UUID cursoId) {
        return asistenciaService.getFechasConAsistencia(cursoId);
    }

    @GetMapping("/mi-asistencia")
    @PreAuthorize("hasRole('ALUMNO')")
    public List<AsistenciaDTO> getMiAsistencia(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario) {
        return asistenciaService.getAsistenciaAlumno(usuario.getId(), cursoId);
    }

    @GetMapping("/mi-asistencia/estadisticas")
    @PreAuthorize("hasRole('ALUMNO')")
    public EstadisticasAsistenciaDTO getMisEstadisticas(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario usuario) {
        return asistenciaService.getEstadisticasAlumno(usuario.getId(), cursoId);
    }

    @GetMapping("/alumno/{alumnoId}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public List<AsistenciaDTO> getAsistenciaAlumno(
            @PathVariable UUID cursoId,
            @PathVariable UUID alumnoId) {
        return asistenciaService.getAsistenciaAlumno(alumnoId, cursoId);
    }

    @GetMapping("/alumno/{alumnoId}/estadisticas")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public EstadisticasAsistenciaDTO getEstadisticasAlumno(
            @PathVariable UUID cursoId,
            @PathVariable UUID alumnoId) {
        return asistenciaService.getEstadisticasAlumno(alumnoId, cursoId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<AsistenciaDTO> registrarAsistencia(
            @PathVariable UUID cursoId,
            @RequestBody RegistroAsistenciaDTO dto) {
        return ResponseEntity.ok(asistenciaService.registrarAsistencia(cursoId, dto));
    }

    @PostMapping("/multiple")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<Void> registrarAsistenciaMultiple(
            @PathVariable UUID cursoId,
            @RequestBody List<RegistroAsistenciaDTO> registros) {
        asistenciaService.registrarAsistenciaMultiple(cursoId, registros);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{asistenciaId}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<AsistenciaDTO> actualizarAsistencia(
            @PathVariable UUID cursoId,
            @PathVariable UUID asistenciaId,
            @RequestBody Map<String, String> body) {
        EstadoAsistencia estado = EstadoAsistencia.valueOf(body.get("estado"));
        String observaciones = body.get("observaciones");
        return ResponseEntity.ok(asistenciaService.actualizarAsistencia(asistenciaId, estado, observaciones));
    }

    @DeleteMapping("/{asistenciaId}")
    @PreAuthorize("hasAnyRole('PROFESOR', 'ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarAsistencia(
            @PathVariable UUID cursoId,
            @PathVariable UUID asistenciaId) {
        asistenciaService.eliminarAsistencia(asistenciaId);
        return ResponseEntity.ok().build();
    }
}
