package com.infocurso.backend.controller;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.service.AlumnoCursoService;
import com.infocurso.backend.service.CursoService;
import com.infocurso.backend.service.EntregaPracticaService;
import com.infocurso.backend.service.EstadisticasProfesorService;
import com.infocurso.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profesor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROFESOR')")
public class ProfesorController {

    private final CursoService cursoService;
    private final CursoRepository cursoRepository;
    private final AlumnoCursoService alumnoCursoService;
    private final UsuarioService usuarioService;
    private final EntregaPracticaService entregaPracticaService;
    private final EstadisticasProfesorService estadisticasProfesorService;

    @GetMapping("/estadisticas")
    public EstadisticasProfesorDTO getEstadisticas(@AuthenticationPrincipal Usuario profesor) {
        return estadisticasProfesorService.getEstadisticasProfesor(profesor.getId());
    }

    @PostMapping("/curso")
    public CursoDTO crearCurso(@RequestBody CursoDTO dto, @AuthenticationPrincipal Usuario profesor) {
        Curso curso = cursoService.crearCurso(dto, profesor);
        return CursoDTO.from(curso, List.of());
    }

    @GetMapping("/cursos")
    public List<CursoDTO> getCursos(Principal principal) {
        String email = principal.getName();
        Usuario profesor = usuarioService.getByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UUID profesorId = profesor.getId();

        return cursoService.getCursosDelProfesor(profesorId).stream()
                .map(curso -> {
                    List<AlumnoDTO> alumnos = alumnoCursoService
                            .listarAlumnosPorCurso(curso.getId())
                            .stream()
                            .map(AlumnoDTO::from)
                            .toList();
                    return CursoDTO.from(curso, alumnos);
                })
                .toList();
    }

    @GetMapping("/curso/{cursoId}/alumnos")
    public List<AlumnoDTO> listarAlumnos(@PathVariable UUID cursoId, @AuthenticationPrincipal Usuario profesor) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        return alumnoCursoService.listarAlumnosPorCurso(cursoId)
                .stream()
                .map(AlumnoDTO::from)
                .toList();
    }

    @PostMapping("/curso/{id}/alumnos")
    public void agregarAlumno(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String email = body.get("email");
        Usuario alumno = usuarioService.getByEmail(email)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        alumnoCursoService.vincularAlumnoACurso(id, alumno);
    }

    @DeleteMapping("/curso/{cursoId}/alumnos/{alumnoId}")
    public void eliminarAlumnoDelCurso(
            @PathVariable UUID cursoId,
            @PathVariable UUID alumnoId,
            @AuthenticationPrincipal Usuario profesor
    ) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        alumnoCursoService.eliminarAlumnoDelCurso(cursoId, alumnoId);
    }

    @GetMapping("/curso/{cursoId}/alumnos-disponibles")
    public List<AlumnoDTO> listarAlumnosDisponibles(@PathVariable UUID cursoId, @AuthenticationPrincipal Usuario profesor) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        return alumnoCursoService.listarAlumnosNoInscritosEnCurso(cursoId)
                .stream()
                .map(AlumnoDTO::from)
                .toList();
    }

    @GetMapping("/curso/{cursoId}/practicas")
    public List<PracticaDTO> listarPracticasCurso(@PathVariable UUID cursoId, @AuthenticationPrincipal Usuario profesor) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        return curso.getPracticas()
                .stream()
                .map(PracticaDTO::from)
                .toList();
    }

    @PostMapping("/curso/{cursoId}/practicas")
    public PracticaDTO crearPracticaCurso(
            @PathVariable UUID cursoId,
            @RequestBody CrearPracticaDTO dto,
            @AuthenticationPrincipal Usuario profesor
    ) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        String descripcionJson;
        try {
            descripcionJson = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(dto.descripcion());
        } catch (Exception e) {
            throw new RuntimeException("Error al serializar la descripción", e);
        }

        return PracticaDTO.from(
                cursoService.crearPractica(
                        curso,
                        dto.titulo(),
                        descripcionJson,
                        dto.fechaEntrega()
                )
        );
    }

    @PutMapping("/entrega/{id}/calificar")
    public ResponseEntity<Void> calificarEntrega(@PathVariable UUID id, @RequestBody CalificacionDTO calificacion) {
        entregaPracticaService.calificarEntrega(id, calificacion);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/curso/{cursoId}/practicas/{practicaId}")
    public void eliminarPractica(
            @PathVariable UUID cursoId,
            @PathVariable UUID practicaId,
            @AuthenticationPrincipal Usuario profesor
    ) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        cursoService.eliminarPractica(practicaId);
    }

    @PutMapping("/curso/{cursoId}/practicas/{practicaId}")
    public PracticaDTO editarPracticaCurso(
            @PathVariable UUID cursoId,
            @PathVariable UUID practicaId,
            @RequestBody CrearPracticaDTO dto,
            @AuthenticationPrincipal Usuario profesor
    ) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        return PracticaDTO.from(cursoService.editarPractica(practicaId, dto));
    }

    @GetMapping("/practica/{practicaId}/entregas")
    public EntregasAgrupadasDTO listarEntregasAgrupadas(@PathVariable UUID practicaId) {
        return entregaPracticaService.getEntregasAgrupadas(practicaId);
    }

    @GetMapping("/curso/{cursoId}")
    public CursoDTO obtenerCursoPorId(@PathVariable UUID cursoId, @AuthenticationPrincipal Usuario profesor) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        return CursoDTO.from(
                curso,
                alumnoCursoService.listarAlumnosPorCurso(cursoId)
                        .stream()
                        .map(AlumnoDTO::from)
                        .toList()
        );
    }

    @PostMapping("/curso/{cursoId}/evento")
    public ResponseEntity<Void> crearEventoCursoProfesor(
            @PathVariable UUID cursoId,
            @RequestBody EventoCursoDTO dto,
            @AuthenticationPrincipal Usuario profesor
    ) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!curso.getProfesor().getId().equals(profesor.getId())) {
            throw new RuntimeException("No autorizado");
        }

        cursoService.crearEventoCurso(curso, dto, profesor);
        return ResponseEntity.ok().build();
    }
}
