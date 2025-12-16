package com.infocurso.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.*;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.EventoCursoRepository;
import com.infocurso.backend.repository.PracticaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final PracticaRepository practicaRepository;
    private final AlumnoConsultaService alumnoConsultaService;
    private final ObjectMapper objectMapper;
    private  final EventoCursoRepository eventoCursoRepository;

    public Curso crearCurso(CursoDTO dto, Usuario profesor) {
        Curso curso = new Curso();
        curso.setNombre(dto.nombre());
        curso.setDescripcion(dto.descripcion());
        curso.setProfesor(profesor); // aquí asocias el curso al profesor autenticado
        return cursoRepository.save(curso);
    }

    public List<Curso> getCursosDelProfesor(UUID profesorId) {
        return cursoRepository.findByProfesorId(profesorId);
    }

    public CursoDTO getCursoById(UUID cursoId) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        List<AlumnoDTO> alumnos = curso.getAlumnos().stream()
                .map(AlumnoDTO::from)
                .toList();

        return CursoDTO.from(curso, alumnos);
    }

    public void eliminarCurso(UUID cursoId) {
        cursoRepository.deleteById(cursoId);
    }

    public List<Curso> findByProfesor(Usuario profesor) {
        return cursoRepository.findByProfesor(profesor);
    }

    public List<Curso> listarCursos() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            Usuario profesor = userPrincipal.getUsuario();
            return cursoRepository.findByProfesor(profesor);
        }
        throw new RuntimeException("Usuario no autenticado o tipo incorrecto");
    }

    public Practica crearPractica(Curso curso, String titulo, String descripcion, LocalDateTime fechaEntrega) {
        Practica practica = Practica.builder()
                .curso(curso)
                .titulo(titulo)
                .descripcion(descripcion)
                .fechaEntrega(fechaEntrega)
                .build();
        return practicaRepository.save(practica);
    }

    public CursoDTO getCursoConPrácticasYAlumnos(UUID cursoId) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        List<AlumnoDTO> alumnos = alumnoConsultaService.listarAlumnosPorCurso(cursoId);

        return CursoDTO.from(curso, alumnos);
    }
    public void eliminarPractica(UUID practicaId) {
        practicaRepository.deleteById(practicaId);
    }

    public Practica editarPractica(UUID practicaId, CrearPracticaDTO dto) {
        Practica practica = practicaRepository.findById(practicaId)
                .orElseThrow(() -> new RuntimeException("Práctica no encontrada"));

        try {
            practica.setTitulo(dto.titulo());
            practica.setDescripcion(objectMapper.writeValueAsString(dto.descripcion()));
            practica.setFechaEntrega(dto.fechaEntrega());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al serializar la descripción", e);
        }

        return practicaRepository.save(practica);
    }
    // Devuelve un CursoDTO completo con módulos, unidades, prácticas, alumnos, etc.
    public CursoDTO getCursoDTO(UUID id) {
        System.out.println("🟢 Intentando cargar curso: " + id);

        Curso curso = cursoRepository.findByIdConTodo(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        try {
            List<AlumnoDTO> alumnos = curso.getAlumnos() != null
                    ? curso.getAlumnos().stream().map(AlumnoDTO::from).toList()
                    : List.of();

            // Construir el DTO
            CursoDTO dto = CursoDTO.from(curso, alumnos);

            // Log detallado del contenido del DTO
            System.out.println("📦 CursoDTO generado:");
            System.out.println("  🆔 ID: " + dto.id());
            System.out.println("  📚 Nombre: " + dto.nombre());
            System.out.println("  🧑‍🏫 Profesor: " + dto.profesor().nombre());
            System.out.println("  👥 Alumnos: " + dto.alumnos().size());
            System.out.println("  📝 Prácticas: " + dto.practicas().size());
            System.out.println("  📦 Módulos: " + dto.modulos().size());

            dto.modulos().forEach(mod -> {
                System.out.println("    ➤ Módulo: " + mod.getNombre());
                System.out.println("       📅 Fechas: " + mod.getFechaInicio() + " → " + mod.getFechaFin());
                System.out.println("       📑 Unidades: " + (mod.getUnidades() != null ? mod.getUnidades().size() : 0));
                if (mod.getUnidades() != null) {
                    mod.getUnidades().forEach(uf -> {
                        System.out.println("         - " + uf.getNombre() + " (" + uf.getFechaInicio() + " → " + uf.getFechaFin() + ")");
                    });
                }
            });

            return dto;

        } catch (Exception e) {
            System.out.println("❌ Error al construir CursoDTO: " + e.getMessage());
            throw e;
        }
    }
    public void crearEventoCurso(Curso curso, EventoCursoDTO dto, Usuario autor) {
        EventoCurso evento = new EventoCurso();
        evento.setCurso(curso);
        evento.setTitulo(dto.titulo());
        evento.setDescripcion(dto.descripcion());
        evento.setFecha(dto.fecha());
        evento.setTipo(dto.tipo());
        evento.setVisiblePara(dto.visiblePara());
        evento.setAutor(autor);
        eventoCursoRepository.save(evento);
    }






    public List<CursoDTO> getTodosLosCursos() {
        return cursoRepository.findAllConRelaciones().stream()
                .map(curso -> CursoDTO.from(
                        curso,
                        curso.getAlumnos().stream().map(AlumnoDTO::from).toList()
                ))
                .toList();
    }

    public void actualizarNombre(UUID cursoId, String nuevoNombre) {
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        curso.setNombre(nuevoNombre);
        cursoRepository.save(curso);
    }

    public void actualizarDescripcion(UUID cursoId, String nuevaDescripcion) {
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        curso.setDescripcion(nuevaDescripcion);
        cursoRepository.save(curso);
    }

}

