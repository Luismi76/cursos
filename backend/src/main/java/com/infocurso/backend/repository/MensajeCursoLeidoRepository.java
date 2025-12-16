package com.infocurso.backend.repository;

import com.infocurso.backend.entity.MensajeCursoLeido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MensajeCursoLeidoRepository extends JpaRepository<MensajeCursoLeido, UUID> {
    Optional<MensajeCursoLeido> findByCursoIdAndUsuarioId(UUID cursoId, UUID usuarioId);
}

