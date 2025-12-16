package com.infocurso.backend.service;

import com.infocurso.backend.dto.EstadisticasProfesorDTO;
import com.infocurso.backend.dto.ResumenCursoProfesorDTO;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.EstadoAsistencia;
import com.infocurso.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EstadisticasProfesorService {

    private final CursoRepository cursoRepository;
    private final EntregaPracticaRepository entregaPracticaRepository;
    private final ExamenRepository examenRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final NotaExamenRepository notaExamenRepository;

    public EstadisticasProfesorDTO getEstadisticasProfesor(UUID profesorId) {
        List<Curso> cursos = cursoRepository.findByProfesorId(profesorId);

        int totalAlumnos = 0;
        int entregasPendientesTotal = 0;
        int examenesProximosTotal = 0;
        double asistenciaSuma = 0;
        int cursosConAsistencia = 0;

        List<ResumenCursoProfesorDTO> resumenCursos = new ArrayList<>();

        for (Curso curso : cursos) {
            UUID cursoId = curso.getId();
            int alumnosCurso = curso.getAlumnos() != null ? curso.getAlumnos().size() : 0;
            totalAlumnos += alumnosCurso;

            // Entregas pendientes de calificar
            Long pendientes = entregaPracticaRepository.contarEntregasPendientesCurso(cursoId);
            int entregasPendientes = pendientes != null ? pendientes.intValue() : 0;
            entregasPendientesTotal += entregasPendientes;

            // Exámenes próximos
            int examenesProximos = examenRepository.findProximosExamenes(cursoId).size();
            examenesProximosTotal += examenesProximos;

            // Asistencia media del curso
            long totalAsistencias = asistenciaRepository.countByCurso(cursoId);
            long presentes = asistenciaRepository.countByCursoAndEstado(cursoId, EstadoAsistencia.PRESENTE);
            long retrasos = asistenciaRepository.countByCursoAndEstado(cursoId, EstadoAsistencia.RETRASO);
            long justificados = asistenciaRepository.countByCursoAndEstado(cursoId, EstadoAsistencia.JUSTIFICADO);

            double asistenciaMedia = 0;
            if (totalAsistencias > 0) {
                asistenciaMedia = ((presentes + retrasos + justificados) * 100.0) / totalAsistencias;
                asistenciaSuma += asistenciaMedia;
                cursosConAsistencia++;
            }

            // Promedio de notas del curso (prácticas + exámenes)
            Double promedioPracticas = entregaPracticaRepository.calcularPromedioNotasCurso(cursoId);
            Double promedioExamenes = notaExamenRepository.calcularPromedioExamen(cursoId);

            double promedioNotas = 0;
            if (promedioPracticas != null && promedioExamenes != null) {
                promedioNotas = (promedioExamenes * 0.6) + (promedioPracticas * 0.4);
            } else if (promedioPracticas != null) {
                promedioNotas = promedioPracticas;
            } else if (promedioExamenes != null) {
                promedioNotas = promedioExamenes;
            }

            resumenCursos.add(new ResumenCursoProfesorDTO(
                    cursoId,
                    curso.getNombre(),
                    alumnosCurso,
                    entregasPendientes,
                    examenesProximos,
                    Math.round(asistenciaMedia * 100.0) / 100.0,
                    Math.round(promedioNotas * 100.0) / 100.0
            ));
        }

        double asistenciaMediaTotal = cursosConAsistencia > 0 ? asistenciaSuma / cursosConAsistencia : 0;

        return new EstadisticasProfesorDTO(
                cursos.size(),
                totalAlumnos,
                entregasPendientesTotal,
                examenesProximosTotal,
                Math.round(asistenciaMediaTotal * 100.0) / 100.0,
                resumenCursos
        );
    }
}
