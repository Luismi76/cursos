package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Asistencia;
import com.infocurso.backend.entity.EstadoAsistencia;

import java.time.LocalDate;
import java.util.UUID;

public record AsistenciaDTO(
        UUID id,
        UUID alumnoId,
        String alumnoNombre,
        UUID cursoId,
        LocalDate fecha,
        EstadoAsistencia estado,
        String observaciones
) {
    public static AsistenciaDTO from(Asistencia asistencia) {
        return new AsistenciaDTO(
                asistencia.getId(),
                asistencia.getAlumno().getId(),
                asistencia.getAlumno().getNombre(),
                asistencia.getCurso().getId(),
                asistencia.getFecha(),
                asistencia.getEstado(),
                asistencia.getObservaciones()
        );
    }
}
