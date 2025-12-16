package com.infocurso.backend.repository;


import com.infocurso.backend.entity.AlumnoCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AlumnoCursoRepository extends JpaRepository<AlumnoCurso, UUID> {
    List<AlumnoCurso> findByCursoId(UUID cursoId);
    List<AlumnoCurso> findByAlumnoId(UUID alumnoId);
    boolean existsByCursoIdAndAlumnoId(UUID cursoId, UUID alumnoId);
    void deleteByCursoIdAndAlumnoId(UUID cursoId, UUID alumnoId);
    @Query("SELECT ac.alumno.id FROM AlumnoCurso ac WHERE ac.curso.id = :cursoId")
    List<UUID> findAlumnoIdsByCursoId(@Param("cursoId") UUID cursoId);
}

