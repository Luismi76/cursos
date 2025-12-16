package com.infocurso.backend.repository;

import com.infocurso.backend.entity.UnidadFormativa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UnidadFormativaRepository extends JpaRepository<UnidadFormativa, UUID> {
}

