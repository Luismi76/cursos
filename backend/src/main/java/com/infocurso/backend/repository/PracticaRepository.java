package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Practica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PracticaRepository extends JpaRepository<Practica, UUID> {
    List<Practica> findByCursoId(UUID cursoId);
}

