package com.infocurso.backend.service;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.*;
import com.infocurso.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final CursoRepository cursoRepository;
    private final CursoService cursoService;
    private final UsuarioRepository usuarioRepository;
    private final ModuloRepository moduloRepository;
    private final UnidadFormativaRepository unidadRepository;
    private final EventoCursoRepository eventoRepository;

    @Override
    public CursoDTO crearCurso(CursoDTO dto) {
        Curso curso = Curso.builder()
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .build();
        cursoRepository.save(curso);

// recarga el curso con relaciones
        Curso cursoConRelaciones = cursoRepository.findByIdConRelaciones(curso.getId())
                .orElseThrow(() -> new RuntimeException("Error al recargar el curso"));

        List<AlumnoDTO> alumnos = cursoConRelaciones.getAlumnos() != null
                ? cursoConRelaciones.getAlumnos().stream().map(AlumnoDTO::from).toList()
                : List.of();

        return CursoDTO.from(cursoConRelaciones, alumnos);
    }

    @Override
    public void asignarProfesor(UUID cursoId, UUID profesorId) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        Usuario profesor = usuarioRepository.findById(profesorId)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        curso.setProfesor(profesor);
        cursoRepository.save(curso);
    }

    @Override
    public void matricularAlumno(UUID cursoId, UUID alumnoId) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
        curso.getAlumnos().add(alumno);
        cursoRepository.save(curso);
    }

    @Override
    public CursoDTO agregarModulo(UUID cursoId, ModuloDTO dto) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Modulo modulo = new Modulo();
        modulo.setNombre(dto.getNombre());
        modulo.setFechaInicio(dto.getFechaInicio());
        modulo.setFechaFin(dto.getFechaFin());

        // ✅ sincronización bidireccional
        curso.agregarModulo(modulo);

        cursoRepository.save(curso); // guarda módulo también gracias a cascade

        Curso actualizado = cursoRepository.findByIdConTodo(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado tras guardar módulo"));

        List<AlumnoDTO> alumnos = actualizado.getAlumnos().stream().map(AlumnoDTO::from).toList();

        return CursoDTO.from(actualizado, alumnos);
    }

    @Override
    @Transactional
    public UnidadFormativaDTO agregarUnidad(UUID moduloId, UnidadFormativaDTO dto) {
        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        UnidadFormativa uf = UnidadFormativa.builder()
                .nombre(dto.getNombre())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .modulo(modulo)
                .build();

        // 1. AÑADIR A LA LISTA DEL MÓDULO
        modulo.getUnidades().add(uf); // ← Esto actualiza el índice automáticamente

        // 2. GUARDAR EL MÓDULO, no la unidad
        moduloRepository.save(modulo); // Cascade.ALL guarda también la unidad
        return dto;
    }


    @Override
    public void crearEventoAdmin(UUID cursoId, EventoCursoDTO dto) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        EventoCurso evento = EventoCurso.builder()
                .titulo(dto.titulo())
                .descripcion(dto.descripcion())
                .fecha(dto.fecha())
                .tipo(dto.tipo())
                .visiblePara(dto.visiblePara())
                .curso(curso)
                .autor(null) // Se puede completar con el usuario autenticado
                .build();

        // ✅ Añadir el evento al curso ANTES de guardar
        curso.getEventos().add(evento);

        // ✅ Guardar el curso para que persista la relación
        cursoRepository.save(curso);
    }



    public List<UsuarioDTO> listarProfesores() {
        return usuarioRepository.findProfesores()
                .stream()
                .map(UsuarioDTO::from)
                .toList();
    }
    @Override
    public void editarModulo(UUID id, ModuloDTO dto) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        modulo.setNombre(dto.getNombre());
        modulo.setFechaInicio(dto.getFechaInicio());
        modulo.setFechaFin(dto.getFechaFin());
        moduloRepository.save(modulo);
    }

    @Override
    public void eliminarModulo(UUID id) {
        if (!moduloRepository.existsById(id)) {
            throw new RuntimeException("Módulo no encontrado");
        }
        moduloRepository.deleteById(id);
    }

    @Override
    public void editarUnidad(UUID id, UnidadFormativaDTO dto) {
        UnidadFormativa uf = unidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada"));

        uf.setNombre(dto.getNombre());
        uf.setFechaInicio(dto.getFechaInicio());
        uf.setFechaFin(dto.getFechaFin());
        unidadRepository.save(uf);
    }

    @Override
    public void eliminarUnidad(UUID id) {
        if (!unidadRepository.existsById(id)) {
            throw new RuntimeException("Unidad no encontrada");
        }
        unidadRepository.deleteById(id);
    }

    @Override
    public UnidadFormativaDTO obtenerUnidadPorId(UUID id) {
        UnidadFormativa unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unidad no encontrada"));

        return new UnidadFormativaDTO(
                unidad.getId(),
                unidad.getNombre(),
                unidad.getFechaInicio(),
                unidad.getFechaFin(),
                unidad.getModulo() != null ? unidad.getModulo().getId() : null
        );
    }


}
