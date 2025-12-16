package com.infocurso.backend.controller;

import com.infocurso.backend.dto.PerfilDTO;
import com.infocurso.backend.dto.UsuarioDTO;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final com.infocurso.backend.service.NotificacionService notificacionService;

    @GetMapping("/notificaciones")
    @PreAuthorize("isAuthenticated()")
    public List<com.infocurso.backend.dto.NotificacionDTO> getNotificaciones(@AuthenticationPrincipal Usuario usuario) {
        return notificacionService.getNotificacionesDeUsuario(usuario.getId());
    }

    @PutMapping("/notificaciones/{id}/leida")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarComoLeida(@PathVariable UUID id, @AuthenticationPrincipal Usuario usuario) {
        notificacionService.marcarComoLeida(id, usuario.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public Usuario registrarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.save(usuario);
    }

    @GetMapping("/{id}")
    public Usuario getUsuarioPorId(@PathVariable UUID id) {
        return usuarioService.getById(id);
    }

    @GetMapping("/buscar")
    public Optional<Usuario> buscarPorEmail(@RequestParam String email) {
        return usuarioService.getByEmail(email);
    }

    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.findAll();
    }

    @GetMapping("/perfil")
    public PerfilDTO obtenerPerfil(@AuthenticationPrincipal Usuario usuario) {
        return PerfilDTO.from(usuario);
    }

    @PutMapping("/perfil")
    public PerfilDTO actualizarPerfil(@AuthenticationPrincipal Usuario usuario, @RequestBody Map<String, String> body) {
        String nuevoNombre = body.get("nombre");
        String avatarUrl = body.get("avatarUrl");

        if (nuevoNombre != null)
            usuario.setNombre(nuevoNombre);
        if (avatarUrl != null)
            usuario.setAvatarUrl(avatarUrl);

        usuario = usuarioService.save(usuario);
        return PerfilDTO.from(usuario);
    }

    @Value("${app.base-url}")
    private String appBaseUrl;

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> subirAvatar(@AuthenticationPrincipal Usuario usuario,
            @RequestParam("file") MultipartFile file) throws IOException {
        String nombreArchivo = usuarioService.actualizarAvatar(usuario.getId(), file);
        String avatarUrl = appBaseUrl + "/uploads/avatars/" + nombreArchivo;
        return ResponseEntity.ok(avatarUrl);
    }

    @GetMapping("/me")
    public UsuarioDTO getPerfilCompleto(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioDTO.from(usuario);
    }
}
