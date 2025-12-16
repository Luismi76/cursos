package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ModuloRepository extends JpaRepository<Modulo, UUID> {
}

