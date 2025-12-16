package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Examen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ExamenRepository extends JpaRepository<Examen, UUID> {

    List<Examen> findByCursoIdOrderByFechaAsc(UUID cursoId);

    @Query("SELECT e FROM Examen e WHERE e.curso.id = :cursoId AND e.fecha > CURRENT_TIMESTAMP ORDER BY e.fecha ASC")
    List<Examen> findProximosExamenes(@Param("cursoId") UUID cursoId);

    @Query("SELECT e FROM Examen e WHERE e.curso.id = :cursoId AND e.fecha <= CURRENT_TIMESTAMP ORDER BY e.fecha DESC")
    List<Examen> findExamenesPasados(@Param("cursoId") UUID cursoId);

    long countByCursoIdAndFechaAfter(UUID cursoId, LocalDateTime fecha);
}
