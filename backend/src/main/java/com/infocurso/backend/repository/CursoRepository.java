package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CursoRepository extends JpaRepository<Curso, UUID> {

    List<Curso> findByProfesorId(UUID profesorId);
    List<Curso> findByProfesor(Usuario profesor);

    @EntityGraph(attributePaths = {
            "profesor",
            "practicas",
            "alumnos",
            "modulos",
            "modulos.unidades", // 👈 añade esto
            "eventos"
    })
    @Query("SELECT c FROM Curso c WHERE c.id = :id")
    Optional<Curso> findByIdConRelaciones(@Param("id") UUID id);


    @EntityGraph(attributePaths = {"profesor", "alumnos", "practicas", "modulos", "modulos.unidades", "eventos"})
    @Query("SELECT c FROM Curso c")
    List<Curso> findAllConRelaciones();

    @Query("""
    SELECT DISTINCT c FROM Curso c
    LEFT JOIN FETCH c.profesor
    LEFT JOIN FETCH c.alumnos
    LEFT JOIN FETCH c.practicas
    LEFT JOIN FETCH c.modulos m
    LEFT JOIN FETCH m.unidades
    LEFT JOIN FETCH c.eventos
    WHERE c.id = :id
""")
    Optional<Curso> findByIdConTodo(@Param("id") UUID id);
}
