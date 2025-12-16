package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Usuario;

import java.util.UUID;

public record UsuarioDTO(UUID id, String nombre, String email, String rol, String avatarUrl) {
    public static UsuarioDTO from(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getAvatarUrl()
        );
    }
}

