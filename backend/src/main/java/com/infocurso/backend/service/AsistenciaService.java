package com.infocurso.backend.service;

import com.infocurso.backend.dto.AsistenciaDTO;
import com.infocurso.backend.dto.EstadisticasAsistenciaDTO;
import com.infocurso.backend.dto.RegistroAsistenciaDTO;
import com.infocurso.backend.entity.Asistencia;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.EstadoAsistencia;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.AsistenciaRepository;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<AsistenciaDTO> getAsistenciaCurso(UUID cursoId) {
        return asistenciaRepository.findByCursoIdOrderByFechaDesc(cursoId)
                .stream()
                .map(AsistenciaDTO::from)
                .toList();
    }

    public List<AsistenciaDTO> getAsistenciaCursoByFecha(UUID cursoId, LocalDate fecha) {
        return asistenciaRepository.findByCursoIdAndFecha(cursoId, fecha)
                .stream()
                .map(AsistenciaDTO::from)
                .toList();
    }

    public List<AsistenciaDTO> getAsistenciaAlumno(UUID alumnoId, UUID cursoId) {
        return asistenciaRepository.findByAlumnoIdAndCursoIdOrderByFechaDesc(alumnoId, cursoId)
                .stream()
                .map(AsistenciaDTO::from)
                .toList();
    }

    public AsistenciaDTO registrarAsistencia(UUID cursoId, RegistroAsistenciaDTO dto) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        Usuario alumno = usuarioRepository.findById(dto.alumnoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));

        // Verificar si ya existe un registro para ese día
        Asistencia asistencia = asistenciaRepository
                .findByAlumnoIdAndCursoIdAndFecha(dto.alumnoId(), cursoId, dto.fecha())
                .orElse(null);

        if (asistencia == null) {
            asistencia = Asistencia.builder()
                    .alumno(alumno)
                    .curso(curso)
                    .fecha(dto.fecha())
                    .estado(dto.estado())
                    .observaciones(dto.observaciones())
                    .build();
        } else {
            asistencia.setEstado(dto.estado());
            asistencia.setObservaciones(dto.observaciones());
        }

        asistencia = asistenciaRepository.save(asistencia);
        return AsistenciaDTO.from(asistencia);
    }

    public void registrarAsistenciaMultiple(UUID cursoId, List<RegistroAsistenciaDTO> registros) {
        for (RegistroAsistenciaDTO dto : registros) {
            registrarAsistencia(cursoId, dto);
        }
    }

    public AsistenciaDTO actualizarAsistencia(UUID asistenciaId, EstadoAsistencia estado, String observaciones) {
        Asistencia asistencia = asistenciaRepository.findById(asistenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro no encontrado"));

        asistencia.setEstado(estado);
        asistencia.setObservaciones(observaciones);
        asistencia = asistenciaRepository.save(asistencia);
        return AsistenciaDTO.from(asistencia);
    }

    public void eliminarAsistencia(UUID asistenciaId) {
        if (!asistenciaRepository.existsById(asistenciaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro no encontrado");
        }
        asistenciaRepository.deleteById(asistenciaId);
    }

    public EstadisticasAsistenciaDTO getEstadisticasAlumno(UUID alumnoId, UUID cursoId) {
        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));

        long total = asistenciaRepository.countByAlumnoAndCurso(alumnoId, cursoId);
        long presentes = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.PRESENTE);
        long ausentes = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.AUSENTE);
        long retrasos = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.RETRASO);
        long justificados = asistenciaRepository.countByAlumnoAndCursoAndEstado(alumnoId, cursoId, EstadoAsistencia.JUSTIFICADO);

        double porcentaje = total > 0 ? ((presentes + retrasos + justificados) * 100.0 / total) : 0;

        return new EstadisticasAsistenciaDTO(
                alumnoId,
                alumno.getNombre(),
                total,
                presentes,
                ausentes,
                retrasos,
                justificados,
                Math.round(porcentaje * 100.0) / 100.0
        );
    }

    public List<LocalDate> getFechasConAsistencia(UUID cursoId) {
        return asistenciaRepository.findDistinctFechasByCursoId(cursoId);
    }
}
