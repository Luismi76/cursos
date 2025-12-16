package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Usuario;
import java.util.UUID;

public record AlumnoDTO(UUID id, String nombre, String email, String avatarUrl) {
    public static AlumnoDTO from(Usuario usuario) {
        return new AlumnoDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getAvatarUrl() // ✅ incluir avatarUrl
        );
    }
}

