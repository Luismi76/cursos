package com.infocurso.backend.repository;

import com.infocurso.backend.entity.AportacionWiki;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AportacionWikiRepository extends JpaRepository<AportacionWiki, UUID> {
    List<AportacionWiki> findByWikiCursoIdOrderByFechaDesc(UUID cursoId);
}
