package com.infocurso.backend.repository;

import com.infocurso.backend.entity.EventoCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventoCursoRepository extends JpaRepository<EventoCurso, UUID> {
    List<EventoCurso> findByCursoId(UUID cursoId);
}


