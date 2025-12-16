package com.infocurso.backend.security;

import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.UsuarioRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = null;

        // 1. Buscar token en cookies primero (HttpOnly)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    System.out.println("🍪 Token encontrado en cookie");
                    break;
                }
            }
        }

        // 2. Fallback: buscar en Authorization header (compatibilidad)
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                System.out.println("📋 Token encontrado en header Authorization");
            }
        }

        if (token != null && jwtUtil.esTokenValido(token)) {
            Claims claims = jwtUtil.getAllClaims(token);
            String email = claims.getSubject();
            String rol = claims.get("rol", String.class);

            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            if (usuario != null) {
                System.out.println("✅ Usuario autenticado: " + email + " con rol: " + rol);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
        System.out.println(
                "👉 Usuario autenticado en contexto: " + SecurityContextHolder.getContext().getAuthentication());
    }
}
