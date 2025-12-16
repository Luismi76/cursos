package com.infocurso.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infocurso.backend.dto.CrearPracticaDTO;
import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Practica;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.PracticaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PracticaService {

    private final PracticaRepository practicaRepository;
    private final CursoService cursoService;
    private final CursoRepository cursoRepository;
    private final ObjectMapper objectMapper;


    public Practica crearPractica(UUID cursoId, String titulo, String descripcion, LocalDateTime fechaEntrega) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Practica practica = Practica.builder()
                .curso(curso)
                .titulo(titulo)
                .descripcion(descripcion)
                .fechaEntrega(fechaEntrega)
                .build();

        return practicaRepository.save(practica);
    }



    public List<Practica> listarPorCurso(UUID cursoId) {
        return practicaRepository.findByCursoId(cursoId);
    }

    public Practica getById(UUID practicaId) {
        return practicaRepository.findById(practicaId)
                .orElseThrow(() -> new RuntimeException("Práctica no encontrada"));
    }

    public Practica crearPractica(CrearPracticaDTO dto, Curso curso) {
        String descripcionJson;
        try {
            descripcionJson = objectMapper.writeValueAsString(dto.descripcion());
        } catch (Exception e) {
            throw new RuntimeException("Error al serializar la descripción", e);
        }

        return Practica.builder()
                .titulo(dto.titulo())
                .descripcion(descripcionJson) // ✅ ahora sí es String
                .fechaEntrega(dto.fechaEntrega())
                .curso(curso)
                .build();
    }

    public Practica getPracticaById(UUID id) {
        return practicaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Práctica no encontrada"));
    }
}
