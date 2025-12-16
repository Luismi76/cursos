package com.infocurso.backend.controller;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.service.AlumnoCursoService;
import com.infocurso.backend.service.CursoService;
import com.infocurso.backend.service.EntregaPracticaService;
import com.infocurso.backend.service.EstadisticasAlumnoService;
import com.infocurso.backend.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alumno")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ALUMNO')")
public class AlumnoController {

    private final AlumnoCursoService alumnoCursoService;
    private final CursoService cursoService;
    private final CursoRepository cursoRepository;
    private final NotificacionService notificacionService;
    private final EntregaPracticaService entregaPracticaService;
    private final EstadisticasAlumnoService estadisticasAlumnoService;

    @GetMapping("/cursos")
    public List<CursoDTO> getCursosDelAlumno(@AuthenticationPrincipal Usuario alumno) {
        return alumnoCursoService.getCursosDelAlumno(alumno.getId())
                .stream()
                .map(curso -> CursoDTO.from(curso, List.of()))
                .toList();
    }

    @GetMapping("/curso/{cursoId}")
    public CursoDTO getCursoDelAlumno(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario alumno
    ) {
        if (!alumnoCursoService.estaInscrito(cursoId, alumno.getId())) {
            throw new RuntimeException("El alumno no está inscrito en este curso.");
        }

        return cursoService.getCursoDTO(cursoId);
    }

    public CursoDTO getCursoConPrácticasYAlumnos(UUID cursoId) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        List<Usuario> alumnos = alumnoCursoService.listarAlumnosPorCurso(cursoId);
        List<AlumnoDTO> alumnoDTOs = alumnos.stream()
                .map(AlumnoDTO::from)
                .toList();

        return CursoDTO.from(curso, alumnoDTOs);
    }

    @PutMapping("/notificaciones/{id}/leida")
    public ResponseEntity<Void> marcarComoLeida(@PathVariable UUID id, @AuthenticationPrincipal Usuario alumno) {
        notificacionService.marcarComoLeida(id, alumno.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notificaciones")
    public List<NotificacionDTO> getNotificaciones(@AuthenticationPrincipal Usuario alumno) {
        return notificacionService.getNotificacionesDeUsuario(alumno.getId());
    }

    @GetMapping("/curso/{cursoId}/historial")
    public EntregasAgrupadasDTO getHistorialCurso(
            @PathVariable UUID cursoId,
            @AuthenticationPrincipal Usuario alumno
    ) {
        if (!alumnoCursoService.estaInscrito(cursoId, alumno.getId())) {
            throw new RuntimeException("No estás inscrito en este curso.");
        }

        return entregaPracticaService.getHistorialAlumnoPorCurso(cursoId, alumno.getId());
    }

    @GetMapping("/practica/{practicaId}/mi-entrega")
    public ResponseEntity<EntregaPracticaDTO> getMiEntrega(
            @PathVariable UUID practicaId,
            @AuthenticationPrincipal Usuario alumno
    ) {
        return entregaPracticaService.getEntregaDeAlumno(practicaId, alumno.getId())
                .map(entrega -> ResponseEntity.ok(EntregaPracticaDTO.from(entrega)))
                .orElse(ResponseEntity.ok(null));
    }

    @GetMapping("/mis")
    public List<EntregaPracticaDTO> listarMisEntregas(@AuthenticationPrincipal Usuario alumno) {
        return entregaPracticaService.getEntregasDeAlumno(alumno.getId())
                .stream()
                .map(EntregaPracticaDTO::from)
                .toList();
    }

    @GetMapping("/estadisticas")
    public EstadisticasAlumnoDTO getEstadisticas(@AuthenticationPrincipal Usuario alumno) {
        return estadisticasAlumnoService.getEstadisticasAlumno(alumno.getId());
    }
}

