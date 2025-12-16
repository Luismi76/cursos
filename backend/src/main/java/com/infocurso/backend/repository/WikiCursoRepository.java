package com.infocurso.backend.repository;

import com.infocurso.backend.entity.WikiCurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WikiCursoRepository extends JpaRepository<WikiCurso, UUID> {
    Optional<WikiCurso> findByCursoId(UUID cursoId);
}

