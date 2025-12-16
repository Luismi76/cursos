package com.infocurso.backend.service;

import com.infocurso.backend.dto.*;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    CursoDTO crearCurso(CursoDTO dto);

    void asignarProfesor(UUID cursoId, UUID profesorId);

    void matricularAlumno(UUID cursoId, UUID alumnoId);

    // ✅ Cambio aquí: ahora devuelve CursoDTO
    CursoDTO agregarModulo(UUID cursoId, ModuloDTO dto);

    UnidadFormativaDTO agregarUnidad(UUID moduloId, UnidadFormativaDTO dto);

    void crearEventoAdmin(UUID cursoId, EventoCursoDTO dto);

    List<UsuarioDTO> listarProfesores();

    void editarModulo(UUID id, ModuloDTO dto);

    void eliminarModulo(UUID id);

    void editarUnidad(UUID id, UnidadFormativaDTO dto);

    void eliminarUnidad(UUID id);

    UnidadFormativaDTO obtenerUnidadPorId(UUID id);

    // Gestión de usuarios
    List<UsuarioDTO> listarUsuarios();

    UsuarioDTO crearUsuario(UsuarioDTO dto, String password);

    UsuarioDTO actualizarUsuario(UUID id, UsuarioDTO dto);

    void eliminarUsuario(UUID id);

}

