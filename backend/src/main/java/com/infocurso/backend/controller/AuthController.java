package com.infocurso.backend.controller;

import com.infocurso.backend.entity.Rol;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.security.JwtUtil;
import com.infocurso.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        Usuario user = (Usuario) auth.getPrincipal();
        String token = jwtUtil.generarToken(user.getEmail(), user.getId(), user.getRol().name());

        // Establecer cookie HttpOnly
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true en producción con HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 horas
        response.addCookie(cookie);

        Map<String, Object> userDto = new HashMap<>();
        userDto.put("id", user.getId());
        userDto.put("nombre", user.getNombre());
        userDto.put("rol", user.getRol().name());
        userDto.put("avatarUrl", user.getAvatarUrl());

        // Devolver solo el usuario (sin token en body)
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String nombre = body.get("nombre");
        String email = body.get("email");
        String password = body.get("password");

        Usuario nuevo = Usuario.builder()
                .nombre(nombre)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .rol(Rol.ALUMNO)
                .build();

        usuarioService.save(nuevo);

        String token = jwtUtil.generarToken(nuevo.getEmail(), nuevo.getId(), nuevo.getRol().name());

        // Establecer cookie HttpOnly
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true en producción con HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 horas
        response.addCookie(cookie);

        Map<String, Object> userDto = new HashMap<>();
        userDto.put("id", nuevo.getId());
        userDto.put("nombre", nuevo.getNombre());
        userDto.put("rol", nuevo.getRol().name());
        userDto.put("avatarUrl", nuevo.getAvatarUrl());

        // Devolver solo el usuario (sin token en body)
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }
}
