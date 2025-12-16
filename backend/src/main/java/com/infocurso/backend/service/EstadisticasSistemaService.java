package com.infocurso.backend.service;

import com.infocurso.backend.dto.EstadisticasSistemaDTO;
import com.infocurso.backend.entity.EstadoAsistencia;
import com.infocurso.backend.entity.Rol;
import com.infocurso.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EstadisticasSistemaService {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final PracticaRepository practicaRepository;
    private final ExamenRepository examenRepository;
    private final EntregaPracticaRepository entregaPracticaRepository;
    private final AsistenciaRepository asistenciaRepository;

    public EstadisticasSistemaDTO getEstadisticasSistema() {
        // Usuarios por rol
        long totalUsuarios = usuarioRepository.count();
        long totalAlumnos = usuarioRepository.countByRol(Rol.ALUMNO);
        long totalProfesores = usuarioRepository.countByRol(Rol.PROFESOR);
        long totalAdministradores = usuarioRepository.countByRol(Rol.ADMINISTRADOR);

        // Cursos
        long totalCursos = cursoRepository.count();
        // Consideramos cursos activos aquellos que tienen al menos un alumno
        long cursosActivos = cursoRepository.findAll().stream()
                .filter(c -> c.getAlumnos() != null && !c.getAlumnos().isEmpty())
                .count();

        // Prácticas y exámenes
        long totalPracticas = practicaRepository.count();
        long totalExamenes = examenRepository.count();

        // Entregas
        long entregasTotales = entregaPracticaRepository.count();
        long entregasPendientes = entregaPracticaRepository.findAll().stream()
                .filter(e -> e.getNota() == null)
                .count();

        // Asistencia media global
        long totalAsistencias = asistenciaRepository.count();
        long presentes = asistenciaRepository.findAll().stream()
                .filter(a -> a.getEstado() == EstadoAsistencia.PRESENTE ||
                             a.getEstado() == EstadoAsistencia.RETRASO ||
                             a.getEstado() == EstadoAsistencia.JUSTIFICADO)
                .count();

        double asistenciaMedia = totalAsistencias > 0
                ? (presentes * 100.0) / totalAsistencias
                : 0;

        return new EstadisticasSistemaDTO(
                (int) totalUsuarios,
                (int) totalAlumnos,
                (int) totalProfesores,
                (int) totalAdministradores,
                (int) totalCursos,
                (int) cursosActivos,
                (int) totalPracticas,
                (int) totalExamenes,
                (int) entregasTotales,
                (int) entregasPendientes,
                Math.round(asistenciaMedia * 100.0) / 100.0
        );
    }
}
