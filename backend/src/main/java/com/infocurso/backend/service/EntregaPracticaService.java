package com.infocurso.backend.service;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.EntregaPractica;
import com.infocurso.backend.entity.Practica;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.EntregaPracticaRepository;
import com.infocurso.backend.repository.PracticaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class EntregaPracticaService {

    private final EntregaPracticaRepository entregaRepo;
    private final PracticaRepository practicaRepository;
    private final AlumnoCursoService alumnoCursoService;
    private final NotificacionService notificacionService;
    // private final CursoService cursoService;
    private final CursoRepository cursoRepository;
    private final UsuarioService usuarioService;

    public EntregaPractica entregarPractica(Usuario alumno, Practica practica, String archivoUrl, String comentario) {
        Optional<EntregaPractica> existente = entregaRepo.findByAlumnoIdAndPracticaId(alumno.getId(), practica.getId());

        EntregaPractica entrega = existente.orElse(
                EntregaPractica.builder()
                        .alumno(alumno)
                        .practica(practica)
                        .build());

        entrega.setArchivoUrl(archivoUrl);
        entrega.setComentario(comentario);
        entrega.setFechaEntrega(LocalDateTime.now());

        return entregaRepo.save(entrega);
    }

    public List<EntregaPractica> getEntregasPorPractica(UUID practicaId) {
        return entregaRepo.findByPracticaId(practicaId);
    }

    public List<EntregaPractica> getEntregasPorAlumno(UUID alumnoId) {
        return entregaRepo.findByAlumnoId(alumnoId);
    }

    public Optional<EntregaPractica> getEntregaDeAlumno(UUID practicaId, UUID alumnoId) {
        return entregaRepo.findByAlumnoIdAndPracticaId(alumnoId, practicaId);
    }

    public void calificarEntrega(UUID id, CalificacionDTO dto) {
        EntregaPractica entrega = entregaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        entrega.setNota(dto.getNota());
        entrega.setComentarioProfesor(dto.getComentarioProfesor());
        entrega.setFechaCalificacion(LocalDateTime.now());
        entregaRepo.save(entrega);

        notificacionService.enviar(
                entrega.getAlumno(),
                "Has recibido una calificación en la práctica '" + entrega.getPractica().getTitulo() + "'",
                "CALIFICACION");
    }

    public EntregasAgrupadasDTO getEntregasAgrupadas(UUID practicaId) {
        Practica practica = practicaRepository.findById(practicaId)
                .orElseThrow(() -> new RuntimeException("Práctica no encontrada"));

        Curso curso = practica.getCurso();
        List<Usuario> alumnos = alumnoCursoService.listarAlumnosPorCurso(curso.getId());

        List<EntregaPractica> entregas = entregaRepo.findByPracticaId(practicaId);

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime fechaLimite = practica.getFechaEntrega();

        List<EntregaPracticaDTO> entregadas = new ArrayList<>();
        List<AlumnoDTO> pendientes = new ArrayList<>();
        List<AlumnoDTO> fueraDePlazo = new ArrayList<>();

        for (Usuario alumno : alumnos) {
            Optional<EntregaPractica> entrega = entregas.stream()
                    .filter(e -> e.getAlumno().getId().equals(alumno.getId()))
                    .findFirst();

            if (entrega.isPresent()) {
                entregadas.add(EntregaPracticaDTO.from(entrega.get()));
            } else if (ahora.isBefore(fechaLimite)) {
                pendientes.add(AlumnoDTO.from(alumno));
            } else {
                fueraDePlazo.add(AlumnoDTO.from(alumno));
            }
        }

        // ✅ Añadir entregas de alumnos que no están listados como inscritos
        Set<UUID> idsYaIncluidos = entregadas.stream()
                .map(e -> e.alumno().id())
                .collect(Collectors.toSet());

        entregas.stream()
                .filter(e -> !idsYaIncluidos.contains(e.getAlumno().getId()))
                .map(EntregaPracticaDTO::from)
                .forEach(entregadas::add);

        EntregasAgrupadasDTO resultado = new EntregasAgrupadasDTO();
        resultado.setEntregadas(entregadas);
        resultado.setPendientes(pendientes);
        resultado.setFueraDePlazo(fueraDePlazo);
        return resultado;
    }

    public EntregasAgrupadasDTO getHistorialAlumnoPorCurso(UUID cursoId, UUID alumnoId) {
        Curso curso = cursoRepository.findByIdConRelaciones(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        Usuario alumno = usuarioService.getById(alumnoId);

        List<Practica> practicas = curso.getPracticas().stream().toList();
        List<EntregaPractica> entregas = entregaRepo.findByAlumnoIdAndCursoId(alumnoId, cursoId);

        Map<UUID, EntregaPractica> entregasPorPractica = entregas.stream()
                .collect(Collectors.toMap(e -> e.getPractica().getId(), Function.identity()));

        LocalDateTime ahora = LocalDateTime.now();

        List<EntregaPracticaDTO> calificadas = new ArrayList<>();
        List<AlumnoDTO> pendientes = new ArrayList<>();
        List<AlumnoDTO> fueraDePlazo = new ArrayList<>();

        for (Practica p : practicas) {
            EntregaPractica entrega = entregasPorPractica.get(p.getId());

            if (entrega != null) {
                calificadas.add(EntregaPracticaDTO.from(entrega));
            } else {
                if (p.getFechaEntrega().isAfter(ahora)) {
                    pendientes.add(AlumnoDTO.from(alumno));
                } else {
                    fueraDePlazo.add(AlumnoDTO.from(alumno));
                }
            }
        }

        return new EntregasAgrupadasDTO(calificadas, pendientes, fueraDePlazo);
    }

    public List<EntregaPractica> getEntregasDeAlumno(UUID alumnoId) {
        return entregaRepo.findByAlumnoId(alumnoId);
    }

}
