package com.infocurso.backend.dto;

import com.infocurso.backend.entity.EntregaPractica;

import java.time.LocalDateTime;
import java.util.UUID;

public record EntregaPracticaDTO(
        UUID id,
        PracticaResumenDTO practica,
        AlumnoResumenDTO alumno,
        String comentario,
        String archivoUrl,
        LocalDateTime fechaEntrega,
        Double nota,
        String comentarioProfesor,
        LocalDateTime fechaCalificacion
) {
    public static EntregaPracticaDTO from(EntregaPractica e) {
        return new EntregaPracticaDTO(
                e.getId(),
                new PracticaResumenDTO(
                        e.getPractica().getId(),
                        e.getPractica().getTitulo()
                ),
                new AlumnoResumenDTO(
                        e.getAlumno().getId(),
                        e.getAlumno().getNombre(),
                        e.getAlumno().getEmail()
                ),
                e.getComentario(),
                e.getArchivoUrl(),
                e.getFechaEntrega(),
                e.getNota(),
                e.getComentarioProfesor(),
                e.getFechaCalificacion()
        );
    }

    public record PracticaResumenDTO(UUID id, String titulo) {}
    public record AlumnoResumenDTO(UUID id, String nombre, String email) {}
}
