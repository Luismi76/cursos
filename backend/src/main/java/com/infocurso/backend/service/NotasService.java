package com.infocurso.backend.service;

import com.infocurso.backend.dto.ResumenNotasCursoDTO;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotasService {

    private final CursoRepository cursoRepository;
    private final EntregaPracticaRepository entregaPracticaRepository;
    private final NotaExamenRepository notaExamenRepository;
    private final AsistenciaRepository asistenciaRepository;

    public List<ResumenNotasCursoDTO> getResumenNotasAlumno(UUID alumnoId) {
        // Obtener todos los cursos del alumno
        List<Curso> cursos = cursoRepository.findCursosByAlumnoId(alumnoId);
        List<ResumenNotasCursoDTO> resumen = new ArrayList<>();

        for (Curso curso : cursos) {
            UUID cursoId = curso.getId();

            // Calcular nota de prácticas
            Double notaPracticas = entregaPracticaRepository.calcularPromedioPracticasAlumno(alumnoId, cursoId);
            Long practicasCalificadas = entregaPracticaRepository.contarPracticasCalificadas(alumnoId, cursoId);

            // Calcular nota de exámenes
            Double notaExamenes = notaExamenRepository.calcularPromedioAlumno(alumnoId, cursoId);
            Long examenesCalificados = notaExamenRepository.countByAlumnoAndCurso(alumnoId, cursoId);

            // Calcular porcentaje de asistencia
            long totalClases = asistenciaRepository.countByAlumnoAndCurso(alumnoId, cursoId);
            long presentes = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId,
                    com.infocurso.backend.entity.EstadoAsistencia.PRESENTE);
            long retrasos = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId,
                    com.infocurso.backend.entity.EstadoAsistencia.RETRASO);
            long justificados = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId,
                    com.infocurso.backend.entity.EstadoAsistencia.JUSTIFICADO);

            double porcentajeAsistencia = totalClases > 0
                    ? ((presentes + retrasos + justificados) * 100.0 / totalClases)
                    : 0;

            // Calcular nota final (70% exámenes, 30% prácticas)
            Double notaFinal = calcularNotaFinal(notaPracticas, notaExamenes);

            resumen.add(new ResumenNotasCursoDTO(
                    cursoId,
                    curso.getNombre(),
                    notaPracticas != null ? Math.round(notaPracticas * 100.0) / 100.0 : null,
                    practicasCalificadas != null ? practicasCalificadas.intValue() : 0,
                    notaExamenes != null ? Math.round(notaExamenes * 100.0) / 100.0 : null,
                    examenesCalificados != null ? examenesCalificados.intValue() : 0,
                    Math.round(porcentajeAsistencia * 100.0) / 100.0,
                    notaFinal
            ));
        }

        return resumen;
    }

    public ResumenNotasCursoDTO getResumenNotasCurso(UUID alumnoId, UUID cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Calcular nota de prácticas
        Double notaPracticas = entregaPracticaRepository.calcularPromedioPracticasAlumno(alumnoId, cursoId);
        Long practicasCalificadas = entregaPracticaRepository.contarPracticasCalificadas(alumnoId, cursoId);

        // Calcular nota de exámenes
        Double notaExamenes = notaExamenRepository.calcularPromedioAlumno(alumnoId, cursoId);
        Long examenesCalificados = notaExamenRepository.countByAlumnoAndCurso(alumnoId, cursoId);

        // Calcular porcentaje de asistencia
        long totalClases = asistenciaRepository.countByAlumnoAndCurso(alumnoId, cursoId);
        long presentes = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId,
                com.infocurso.backend.entity.EstadoAsistencia.PRESENTE);
        long retrasos = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId,
                com.infocurso.backend.entity.EstadoAsistencia.RETRASO);
        long justificados = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId,
                com.infocurso.backend.entity.EstadoAsistencia.JUSTIFICADO);

        double porcentajeAsistencia = totalClases > 0
                ? ((presentes + retrasos + justificados) * 100.0 / totalClases)
                : 0;

        // Calcular nota final
        Double notaFinal = calcularNotaFinal(notaPracticas, notaExamenes);

        return new ResumenNotasCursoDTO(
                cursoId,
                curso.getNombre(),
                notaPracticas != null ? Math.round(notaPracticas * 100.0) / 100.0 : null,
                practicasCalificadas != null ? practicasCalificadas.intValue() : 0,
                notaExamenes != null ? Math.round(notaExamenes * 100.0) / 100.0 : null,
                examenesCalificados != null ? examenesCalificados.intValue() : 0,
                Math.round(porcentajeAsistencia * 100.0) / 100.0,
                notaFinal
        );
    }

    private Double calcularNotaFinal(Double notaPracticas, Double notaExamenes) {
        if (notaPracticas == null && notaExamenes == null) {
            return null;
        }

        // Si solo hay prácticas
        if (notaExamenes == null) {
            return Math.round(notaPracticas * 100.0) / 100.0;
        }

        // Si solo hay exámenes
        if (notaPracticas == null) {
            return Math.round(notaExamenes * 100.0) / 100.0;
        }

        // Ponderación: 60% exámenes, 40% prácticas
        double notaFinal = (notaExamenes * 0.6) + (notaPracticas * 0.4);
        return Math.round(notaFinal * 100.0) / 100.0;
    }
}
