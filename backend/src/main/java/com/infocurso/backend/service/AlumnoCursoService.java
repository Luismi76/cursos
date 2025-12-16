package com.infocurso.backend.service;

import com.infocurso.backend.entity.AlumnoCurso;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.AlumnoCursoRepository;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlumnoCursoService {

    private final AlumnoCursoRepository alumnoCursoRepository;
    private final CursoService cursoService;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public List<Usuario> listarAlumnosPorCurso(UUID cursoId) {
        return alumnoCursoRepository.findByCursoId(cursoId)
                .stream()
                .map(AlumnoCurso::getAlumno)
                .toList();
    }

    public void vincularAlumnoACurso(UUID cursoId, Usuario alumno) {
        if (!alumnoCursoRepository.existsByCursoIdAndAlumnoId(cursoId, alumno.getId())) {
            Curso curso = cursoRepository.findById(cursoId)
                    .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

            AlumnoCurso relacion = AlumnoCurso.builder()
                    .curso(curso)
                    .alumno(alumno)
                    .build();
            alumnoCursoRepository.save(relacion);
        }
    }

    public void eliminarAlumnoDelCurso(UUID cursoId, UUID alumnoId) {
        alumnoCursoRepository.deleteByCursoIdAndAlumnoId(cursoId, alumnoId);
    }

    public List<Usuario> listarAlumnosNoInscritosEnCurso(UUID cursoId) {
        List<UUID> idsInscritos = alumnoCursoRepository.findAlumnoIdsByCursoId(cursoId);
        return usuarioRepository.findAlumnosNoEnCurso(idsInscritos);
    }

    public List<com.infocurso.backend.entity.Curso> getCursosDelAlumno(UUID alumnoId) {
        return alumnoCursoRepository.findByAlumnoId(alumnoId)
                .stream()
                .map(AlumnoCurso::getCurso)
                .toList();
    }
    public boolean estaInscrito(UUID cursoId, UUID alumnoId) {
        return alumnoCursoRepository.existsByCursoIdAndAlumnoId(cursoId, alumnoId);
    }
}

