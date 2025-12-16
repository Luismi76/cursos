package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Usuario;

import java.util.UUID;

public record PerfilDTO(
        UUID id,
        String nombre,
        String email,
        String rol,
        String avatarUrl
) {
    public static PerfilDTO from(Usuario usuario) {
        return new PerfilDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getAvatarUrl()
        );
    }
}

