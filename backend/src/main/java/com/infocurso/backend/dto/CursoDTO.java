package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Curso;
import lombok.Builder;

import java.util.*;


@Builder
public record CursoDTO(
        UUID id,
        String nombre,
        String descripcion,
        UsuarioDTO profesor,
        List<AlumnoDTO> alumnos,
        List<PracticaDTO> practicas,
        List<ModuloDTO> modulos,
        List<EventoCursoDTO> eventos
) {
    public static CursoDTO from(Curso curso, List<AlumnoDTO> alumnos) {
        UsuarioDTO profesor = curso.getProfesor() != null
                ? UsuarioDTO.from(curso.getProfesor())
                : null;

        // 📝 Prácticas
        List<PracticaDTO> practicas = curso.getPracticas() != null
                ? curso.getPracticas().stream()
                .distinct()
                .map(PracticaDTO::from)
                .toList()
                : Collections.emptyList();

        // 📦 Módulos
        List<ModuloDTO> modulos = curso.getModulos() != null
                ? curso.getModulos().stream()
                .map(ModuloDTO::from)
                .filter(Objects::nonNull)
                .distinct()
                .toList()
                : Collections.emptyList();


        // 🗓️ Eventos
        List<EventoCursoDTO> eventos = curso.getEventos() != null
                ? curso.getEventos().stream()
                .distinct()
                .map(EventoCursoDTO::from)
                .toList()
                : Collections.emptyList();

        // 👥 Alumnos
        List<AlumnoDTO> listaAlumnos = alumnos != null
                ? alumnos
                : Collections.emptyList();

        return new CursoDTO(
                curso.getId(),
                curso.getNombre(),
                curso.getDescripcion(),
                profesor,
                listaAlumnos,
                practicas,
                modulos,
                eventos
        );
    }

}
