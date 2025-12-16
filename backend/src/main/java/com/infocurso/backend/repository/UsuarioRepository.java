package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Rol;
import com.infocurso.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    @Query("SELECT u FROM Usuario u WHERE u.rol = 'ALUMNO' AND u.id NOT IN :ids")
    List<Usuario> findAlumnosNoEnCurso(@Param("ids") List<UUID> ids);
    @Query("SELECT u FROM Usuario u WHERE u.rol = 'PROFESOR'")
    List<Usuario> findProfesores();

    long countByRol(Rol rol);
}
