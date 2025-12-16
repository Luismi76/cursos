package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Asistencia;
import com.infocurso.backend.entity.EstadoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AsistenciaRepository extends JpaRepository<Asistencia, UUID> {

    List<Asistencia> findByCursoIdOrderByFechaDesc(UUID cursoId);

    List<Asistencia> findByCursoIdAndFecha(UUID cursoId, LocalDate fecha);

    List<Asistencia> findByAlumnoIdAndCursoIdOrderByFechaDesc(UUID alumnoId, UUID cursoId);

    Optional<Asistencia> findByAlumnoIdAndCursoIdAndFecha(UUID alumnoId, UUID cursoId, LocalDate fecha);

    @Query("SELECT COUNT(a) FROM Asistencia a WHERE a.alumno.id = :alumnoId AND a.curso.id = :cursoId")
    long countByAlumnoAndCurso(@Param("alumnoId") UUID alumnoId, @Param("cursoId") UUID cursoId);

    @Query("SELECT COUNT(a) FROM Asistencia a WHERE a.alumno.id = :alumnoId AND a.curso.id = :cursoId AND a.estado = :estado")
    long countByAlumnoAndCursoAndEstado(@Param("alumnoId") UUID alumnoId, @Param("cursoId") UUID cursoId, @Param("estado") EstadoAsistencia estado);

    @Query("SELECT DISTINCT a.fecha FROM Asistencia a WHERE a.curso.id = :cursoId ORDER BY a.fecha DESC")
    List<LocalDate> findDistinctFechasByCursoId(@Param("cursoId") UUID cursoId);
}
