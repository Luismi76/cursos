package com.infocurso.backend.repository;

import com.infocurso.backend.entity.NotaExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotaExamenRepository extends JpaRepository<NotaExamen, UUID> {

    List<NotaExamen> findByExamenId(UUID examenId);

    List<NotaExamen> findByAlumnoIdAndExamenCursoId(UUID alumnoId, UUID cursoId);

    Optional<NotaExamen> findByExamenIdAndAlumnoId(UUID examenId, UUID alumnoId);

    @Query("SELECT AVG(n.nota) FROM NotaExamen n WHERE n.alumno.id = :alumnoId AND n.examen.curso.id = :cursoId AND n.nota IS NOT NULL")
    Double calcularPromedioAlumno(@Param("alumnoId") UUID alumnoId, @Param("cursoId") UUID cursoId);

    @Query("SELECT AVG(n.nota) FROM NotaExamen n WHERE n.examen.id = :examenId AND n.nota IS NOT NULL")
    Double calcularPromedioExamen(@Param("examenId") UUID examenId);

    @Query("SELECT COUNT(n) FROM NotaExamen n WHERE n.alumno.id = :alumnoId AND n.examen.curso.id = :cursoId AND n.nota IS NOT NULL")
    Long countByAlumnoAndCurso(@Param("alumnoId") UUID alumnoId, @Param("cursoId") UUID cursoId);
}
