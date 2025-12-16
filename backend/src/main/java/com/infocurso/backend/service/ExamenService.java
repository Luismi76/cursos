package com.infocurso.backend.service;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.*;
import com.infocurso.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamenService {

    private final ExamenRepository examenRepository;
    private final NotaExamenRepository notaExamenRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;

    // Obtener todos los exámenes de un curso
    public List<ExamenDTO> getExamenesCurso(UUID cursoId) {
        return examenRepository.findByCursoIdOrderByFechaAsc(cursoId)
                .stream()
                .map(e -> {
                    int totalNotas = e.getNotas().size();
                    Double promedio = notaExamenRepository.calcularPromedioExamen(e.getId());
                    return ExamenDTO.from(e, totalNotas, promedio);
                })
                .toList();
    }

    // Obtener próximos exámenes
    public List<ExamenDTO> getProximosExamenes(UUID cursoId) {
        return examenRepository.findProximosExamenes(cursoId)
                .stream()
                .map(ExamenDTO::from)
                .toList();
    }

    // Obtener exámenes pasados
    public List<ExamenDTO> getExamenesPasados(UUID cursoId) {
        return examenRepository.findExamenesPasados(cursoId)
                .stream()
                .map(e -> {
                    int totalNotas = e.getNotas().size();
                    Double promedio = notaExamenRepository.calcularPromedioExamen(e.getId());
                    return ExamenDTO.from(e, totalNotas, promedio);
                })
                .toList();
    }

    // Crear examen
    public ExamenDTO crearExamen(UUID cursoId, CrearExamenDTO dto) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        Examen examen = Examen.builder()
                .titulo(dto.titulo())
                .descripcion(dto.descripcion())
                .curso(curso)
                .fecha(dto.fecha())
                .tipo(dto.tipo())
                .puntuacionMaxima(dto.puntuacionMaxima() != null ? dto.puntuacionMaxima() : 10.0)
                .build();

        examen = examenRepository.save(examen);
        return ExamenDTO.from(examen);
    }

    // Actualizar examen
    public ExamenDTO actualizarExamen(UUID examenId, CrearExamenDTO dto) {
        Examen examen = examenRepository.findById(examenId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Examen no encontrado"));

        examen.setTitulo(dto.titulo());
        examen.setDescripcion(dto.descripcion());
        examen.setFecha(dto.fecha());
        examen.setTipo(dto.tipo());
        if (dto.puntuacionMaxima() != null) {
            examen.setPuntuacionMaxima(dto.puntuacionMaxima());
        }

        examen = examenRepository.save(examen);
        return ExamenDTO.from(examen);
    }

    // Eliminar examen
    public void eliminarExamen(UUID examenId) {
        if (!examenRepository.existsById(examenId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Examen no encontrado");
        }
        examenRepository.deleteById(examenId);
    }

    // Obtener notas de un examen
    public List<NotaExamenDTO> getNotasExamen(UUID examenId) {
        return notaExamenRepository.findByExamenId(examenId)
                .stream()
                .map(NotaExamenDTO::from)
                .toList();
    }

    // Obtener mis notas de exámenes (para alumno)
    public List<NotaExamenDTO> getMisNotasExamenes(UUID alumnoId, UUID cursoId) {
        return notaExamenRepository.findByAlumnoIdAndExamenCursoId(alumnoId, cursoId)
                .stream()
                .map(NotaExamenDTO::from)
                .toList();
    }

    // Obtener promedio de un alumno
    public Double getPromedioAlumno(UUID alumnoId, UUID cursoId) {
        return notaExamenRepository.calcularPromedioAlumno(alumnoId, cursoId);
    }

    // Registrar nota individual
    public NotaExamenDTO registrarNota(UUID examenId, RegistrarNotaDTO dto) {
        Examen examen = examenRepository.findById(examenId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Examen no encontrado"));

        Usuario alumno = usuarioRepository.findById(dto.alumnoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));

        // Buscar si ya existe una nota
        NotaExamen nota = notaExamenRepository.findByExamenIdAndAlumnoId(examenId, dto.alumnoId())
                .orElse(null);

        if (nota == null) {
            nota = NotaExamen.builder()
                    .examen(examen)
                    .alumno(alumno)
                    .nota(dto.nota())
                    .observaciones(dto.observaciones())
                    .build();
        } else {
            nota.setNota(dto.nota());
            nota.setObservaciones(dto.observaciones());
        }

        nota = notaExamenRepository.save(nota);
        return NotaExamenDTO.from(nota);
    }

    // Registrar múltiples notas
    public void registrarNotasMultiples(UUID examenId, List<RegistrarNotaDTO> notas) {
        for (RegistrarNotaDTO dto : notas) {
            registrarNota(examenId, dto);
        }
    }

    // Eliminar nota
    public void eliminarNota(UUID notaId) {
        if (!notaExamenRepository.existsById(notaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota no encontrada");
        }
        notaExamenRepository.deleteById(notaId);
    }
}
