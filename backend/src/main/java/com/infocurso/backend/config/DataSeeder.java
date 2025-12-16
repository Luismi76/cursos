package com.infocurso.backend.config;

import com.infocurso.backend.entity.Curso;
import com.infocurso.backend.entity.Rol;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0 || cursoRepository.count() > 0) return;

        // Crear usuario administrador
        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setEmail("admin@demo.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123")); // Puedes cambiarla
        admin.setRol(Rol.ADMINISTRADOR);
        usuarioRepository.save(admin);

        List<Usuario> profesores = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Usuario profesor = new Usuario();
            profesor.setNombre("Profesor " + i);
            profesor.setEmail("profesor" + i + "@demo.com");
            profesor.setPasswordHash(passwordEncoder.encode("password"));
            profesor.setRol(Rol.PROFESOR);
            profesores.add(usuarioRepository.save(profesor));
        }

        List<Usuario> alumnos = new ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            Usuario alumno = new Usuario();
            alumno.setNombre("Alumno " + i);
            alumno.setEmail("alumno" + i + "@demo.com");
            alumno.setPasswordHash(passwordEncoder.encode("password"));
            alumno.setRol(Rol.ALUMNO);
            alumnos.add(usuarioRepository.save(alumno));
        }

        Random random = new Random();
        for (Usuario profesor : profesores) {
            for (int j = 1; j <= 2; j++) {
                Curso curso = new Curso();
                curso.setNombre("Curso de " + profesor.getNombre() + " - " + j);
                curso.setProfesor(profesor);

                Set<Usuario> alumnosAsignados = new HashSet<>();
                while (alumnosAsignados.size() < 15) {
                    Usuario alumnoAleatorio = alumnos.get(random.nextInt(alumnos.size()));
                    alumnosAsignados.add(alumnoAleatorio);
                }

                cursoRepository.save(curso);
            }
        }

        System.out.println("✅ Base de datos poblada con administrador, profesores, alumnos y cursos.");
    }

}
