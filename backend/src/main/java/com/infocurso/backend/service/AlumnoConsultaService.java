package com.infocurso.backend.service;

import com.infocurso.backend.dto.AlumnoDTO;
import com.infocurso.backend.repository.AlumnoCursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlumnoConsultaService {

    private final AlumnoCursoRepository alumnoCursoRepository;

    public List<AlumnoDTO> listarAlumnosPorCurso(UUID cursoId) {
        return alumnoCursoRepository.findByCursoId(cursoId)
                .stream()
                .map(a -> AlumnoDTO.from(a.getAlumno()))
                .toList();
    }
}

