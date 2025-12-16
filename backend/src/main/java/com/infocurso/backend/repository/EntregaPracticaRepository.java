package com.infocurso.backend.repository;

import com.infocurso.backend.entity.EntregaPractica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntregaPracticaRepository extends JpaRepository<EntregaPractica, UUID> {
    List<EntregaPractica> findByPracticaId(UUID practicaId);
    Optional<EntregaPractica> findByAlumnoIdAndPracticaId(UUID alumnoId, UUID practicaId);

    @Query("""
    SELECT e
    FROM EntregaPractica e
    WHERE e.alumno.id = :alumnoId
      AND e.practica.curso.id = :cursoId
""")
    List<EntregaPractica> findByAlumnoIdAndCursoId(UUID alumnoId, UUID cursoId);

    List<EntregaPractica> findByAlumnoId(UUID alumnoId);

    @Query("SELECT AVG(e.nota) FROM EntregaPractica e WHERE e.alumno.id = :alumnoId AND e.practica.curso.id = :cursoId AND e.nota IS NOT NULL")
    Double calcularPromedioPracticasAlumno(UUID alumnoId, UUID cursoId);

    @Query("SELECT COUNT(e) FROM EntregaPractica e WHERE e.alumno.id = :alumnoId AND e.practica.curso.id = :cursoId AND e.nota IS NOT NULL")
    Long contarPracticasCalificadas(UUID alumnoId, UUID cursoId);

}
