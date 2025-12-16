package com.infocurso.backend.service;

import com.infocurso.backend.dto.EstadisticasAlumnoDTO;
import com.infocurso.backend.dto.EstadisticasAlumnoDTO.ResumenCursoAlumnoDTO;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.EstadoAsistencia;
import com.infocurso.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EstadisticasAlumnoService {

    private final CursoRepository cursoRepository;
    private final EntregaPracticaRepository entregaPracticaRepository;
    private final PracticaRepository practicaRepository;
    private final NotaExamenRepository notaExamenRepository;
    private final ExamenRepository examenRepository;
    private final AsistenciaRepository asistenciaRepository;

    public EstadisticasAlumnoDTO getEstadisticasAlumno(UUID alumnoId) {
        List<Curso> cursos = cursoRepository.findCursosByAlumnoId(alumnoId);

        int totalPracticasEntregadas = 0;
        int totalPracticasPendientes = 0;
        int totalExamenesPendientes = 0;
        double sumaNotas = 0;
        int contadorNotas = 0;
        double sumaAsistencia = 0;
        int contadorAsistencia = 0;

        List<ResumenCursoAlumnoDTO> resumenCursos = new ArrayList<>();

        for (Curso curso : cursos) {
            UUID cursoId = curso.getId();

            // Prácticas
            long entregadas = entregaPracticaRepository.contarEntregasAlumno(alumnoId, cursoId);
            long totalPracticas = practicaRepository.countByCursoId(cursoId);
            long pendientesCurso = totalPracticas - entregadas;

            totalPracticasEntregadas += (int) entregadas;
            totalPracticasPendientes += (int) pendientesCurso;

            // Nota de prácticas
            Double notaPracticas = entregaPracticaRepository.calcularPromedioPracticasAlumno(alumnoId, cursoId);

            // Nota de exámenes
            Double notaExamenes = notaExamenRepository.calcularPromedioAlumno(alumnoId, cursoId);
            Long examenesRealizados = notaExamenRepository.countByAlumnoAndCurso(alumnoId, cursoId);

            // Exámenes pendientes (futuros sin nota)
            long totalExamenes = examenRepository.countByCursoIdAndFechaAfter(cursoId, LocalDateTime.now());
            totalExamenesPendientes += (int) totalExamenes;

            // Calcular nota actual del curso (60% exámenes, 40% prácticas)
            Double notaActual = calcularNotaFinal(notaPracticas, notaExamenes);
            if (notaActual != null) {
                sumaNotas += notaActual;
                contadorNotas++;
            }

            // Asistencia
            long totalClases = asistenciaRepository.countByAlumnoAndCurso(alumnoId, cursoId);
            long presentes = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.PRESENTE);
            long retrasos = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.RETRASO);
            long justificados = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.JUSTIFICADO);

            double porcentajeAsistenciaCurso = totalClases > 0
                    ? ((presentes + retrasos + justificados) * 100.0 / totalClases)
                    : 100.0;

            if (totalClases > 0) {
                sumaAsistencia += porcentajeAsistenciaCurso;
                contadorAsistencia++;
            }

            resumenCursos.add(new ResumenCursoAlumnoDTO(
                    cursoId.toString(),
                    curso.getNombre(),
                    notaActual != null ? Math.round(notaActual * 100.0) / 100.0 : null,
                    (int) entregadas,
                    (int) pendientesCurso,
                    Math.round(porcentajeAsistenciaCurso * 100.0) / 100.0,
                    examenesRealizados != null ? examenesRealizados.intValue() : 0,
                    (int) totalExamenes
            ));
        }

        Double promedioGeneral = contadorNotas > 0
                ? Math.round((sumaNotas / contadorNotas) * 100.0) / 100.0
                : null;

        Double porcentajeAsistenciaGlobal = contadorAsistencia > 0
                ? Math.round((sumaAsistencia / contadorAsistencia) * 100.0) / 100.0
                : 100.0;

        return new EstadisticasAlumnoDTO(
                cursos.size(),
                totalPracticasEntregadas,
                totalPracticasPendientes,
                promedioGeneral,
                porcentajeAsistenciaGlobal,
                totalExamenesPendientes,
                resumenCursos
        );
    }

    private Double calcularNotaFinal(Double notaPracticas, Double notaExamenes) {
        if (notaPracticas == null && notaExamenes == null) {
            return null;
        }
        if (notaExamenes == null) {
            return notaPracticas;
        }
        if (notaPracticas == null) {
            return notaExamenes;
        }
        return (notaExamenes * 0.6) + (notaPracticas * 0.4);
    }
}
