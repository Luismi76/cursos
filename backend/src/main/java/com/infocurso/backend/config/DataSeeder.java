package com.infocurso.backend.config;

import com.infocurso.backend.entity.*;
import com.infocurso.backend.repository.AlumnoCursoRepository;
import com.infocurso.backend.repository.CursoRepository;
import com.infocurso.backend.repository.EntregaPracticaRepository;
import com.infocurso.backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final EntregaPracticaRepository entregaPracticaRepository;
    private final com.infocurso.backend.repository.PracticaRepository practicaRepository;
    private final AlumnoCursoRepository alumnoCursoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            System.out.println("⚠️ La base de datos ya contiene datos. Saltando DataSeeder.");
            return;
        }

        System.out.println("🌱 Iniciando DataSeeder mejorado...");

        // 1. Usuarios
        Usuario admin = crearUsuario("Administrador", "admin@demo.com", Rol.ADMINISTRADOR);
        List<Usuario> profesores = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            profesores.add(crearUsuario("Profesor " + i, "profesor" + i + "@demo.com", Rol.PROFESOR));
        }
        List<Usuario> alumnos = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            alumnos.add(crearUsuario("Alumno " + i, "alumno" + i + "@demo.com", Rol.ALUMNO));
        }

        usuarioRepository.save(admin);
        usuarioRepository.saveAll(profesores);
        usuarioRepository.saveAll(alumnos);

        // 2. Cursos
        for (Usuario profesor : profesores) {
            crearCursoCompleto(profesor, alumnos, 1);
            crearCursoCompleto(profesor, alumnos, 2);
        }

        System.out.println("✅ Base de datos poblada exitosamente.");
    }

    private Usuario crearUsuario(String nombre, String email, Rol rol) {
        return Usuario.builder()
                .nombre(nombre)
                .email(email)
                .passwordHash(passwordEncoder.encode("password"))
                .rol(rol)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + email)
                .build();
    }

    private void crearCursoCompleto(Usuario profesor, List<Usuario> todosAlumnos, int indice) {
        String nombreCurso = "Curso de Desarrollo Web " + (indice == 1 ? "Frontend" : "Backend") + " - Prof. "
                + profesor.getNombre();
        Curso curso = Curso.builder()
                .nombre(nombreCurso)
                .descripcion(
                        "Curso completo de cero a experto. Aprenderás las tecnologías más demandadas del mercado con proyectos prácticos.")
                .profesor(profesor)
                .build();

        // Módulos (Trimestres)
        LocalDate inicioCurso = LocalDate.now().minusMonths(3); // Empezó hace 3 meses

        Modulo mod1 = crearModulo(curso, "Trimestre 1: Fundamentos", inicioCurso, inicioCurso.plusMonths(2));
        Modulo mod2 = crearModulo(curso, "Trimestre 2: Avanzado", inicioCurso.plusMonths(3), inicioCurso.plusMonths(5));
        Modulo mod3 = crearModulo(curso, "Trimestre 3: Proyecto Final", inicioCurso.plusMonths(6),
                inicioCurso.plusMonths(8));

        curso.agregarModulo(mod1);
        curso.agregarModulo(mod2);
        curso.agregarModulo(mod3);

        // Unidades Formativas
        mod1.getUnidades().add(crearUF(mod1, "UF1: Introducción", 1));
        mod1.getUnidades().add(crearUF(mod1, "UF2: Sintaxis Básica", 2));
        mod2.getUnidades().add(crearUF(mod2, "UF3: Frameworks", 1));
        mod2.getUnidades().add(crearUF(mod2, "UF4: APIs y Servicios", 2));

        // Eventos del Calendario
        curso.getEventos().add(
                crearEvento(curso, "Inicio de Curso", TipoEvento.INICIO_CURSO, inicioCurso, VisibilidadEvento.ALUMNO));
        curso.getEventos().add(crearEvento(curso, "Examen Parcial", TipoEvento.EVALUACION,
                inicioCurso.plusMonths(2).minusDays(5), VisibilidadEvento.ALUMNO));
        curso.getEventos().add(crearEvento(curso, "Entrega Final", TipoEvento.ENTREGA, inicioCurso.plusMonths(8),
                VisibilidadEvento.ALUMNO));
        curso.getEventos().add(crearEvento(curso, "Reunión de Profesores", TipoEvento.OTRO, inicioCurso.plusDays(15),
                VisibilidadEvento.PROFESOR));

        // Guardar curso (Cascada guarda módulos y eventos)
        curso = cursoRepository.save(curso);

        // Asignar 10 alumnos aleatorios (Usando Entidad AlumnoCurso)
        Collections.shuffle(todosAlumnos);
        Set<Usuario> alumnosCurso = new HashSet<>(todosAlumnos.subList(0, 10));

        for (Usuario alumno : alumnosCurso) {
            AlumnoCurso relacion = AlumnoCurso.builder()
                    .curso(curso)
                    .alumno(alumno)
                    .build();
            alumnoCursoRepository.save(relacion);
        }

        // Prácticas y Entregas
        crearPracticasYEntregas(curso, alumnosCurso);
    }

    private Modulo crearModulo(Curso curso, String nombre, LocalDate inicio, LocalDate fin) {
        return Modulo.builder()
                .nombre(nombre)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .curso(curso)
                .unidades(new ArrayList<>())
                .build();
    }

    private UnidadFormativa crearUF(Modulo modulo, String nombre, int orden) {
        return UnidadFormativa.builder()
                .nombre(nombre)
                .modulo(modulo)
                .ordenUnidad(orden)
                .fechaInicio(modulo.getFechaInicio().plusDays((orden - 1) * 15L))
                .fechaFin(modulo.getFechaInicio().plusDays(orden * 15L))
                .build();
    }

    private EventoCurso crearEvento(Curso curso, String titulo, TipoEvento tipo, LocalDate fecha,
            VisibilidadEvento visibilidad) {
        return EventoCurso.builder()
                .curso(curso)
                .titulo(titulo)
                .descripcion("Evento generado automáticamente.")
                .tipo(tipo)
                .fecha(fecha)
                .visiblePara(visibilidad)
                .build();
    }

    private void crearPracticasYEntregas(Curso curso, Set<Usuario> alumnos) {
        // 1. Práctica PASADA (Cerrada)
        Practica p1 = crearPractica(curso, "Práctica 1: HTML & CSS",
                "{\"time\":1706626650577,\"blocks\":[{\"id\":\"header1\",\"type\":\"header\",\"data\":{\"text\":\"Objetivos\",\"level\":2}},{\"id\":\"list1\",\"type\":\"list\",\"data\":{\"style\":\"ordered\",\"items\":[\"Crear estructura semántica\",\"Aplicar estilos básicos\"]}}],\"version\":\"2.29.0\"}",
                LocalDateTime.now().minusWeeks(2)); // Venció hace 2 semanas

        // 2. Práctica ACTUAL (Vence pronto)
        Practica p2 = crearPractica(curso, "Práctica 2: JavaScript DOM",
                "{\"time\":1706626650577,\"blocks\":[{\"id\":\"header2\",\"type\":\"header\",\"data\":{\"text\":\"Requisitos\",\"level\":2}},{\"id\":\"p1\",\"type\":\"paragraph\",\"data\":{\"text\":\"Debes manipular el DOM para crear una lista de tareas interactiva.\"}}],\"version\":\"2.29.0\"}",
                LocalDateTime.now().plusDays(3)); // Vence en 3 días

        // 3. Práctica FUTURA (Lejana)
        Practica p3 = crearPractica(curso, "Práctica 3: React Components",
                "{\"time\":1706626650577,\"blocks\":[{\"id\":\"header3\",\"type\":\"header\",\"data\":{\"text\":\"Introducción a React\",\"level\":2}},{\"id\":\"p2\",\"type\":\"paragraph\",\"data\":{\"text\":\"Materia avanzada para el segundo trimestre.\"}}],\"version\":\"2.29.0\"}",
                LocalDateTime.now().plusMonths(1));

        // GUARDAR PRÁCTICAS EXPLÍCITAMENTE
        p1 = practicaRepository.save(p1);
        p2 = practicaRepository.save(p2);
        p3 = practicaRepository.save(p3);

        // GENERAR ENTREGAS
        // Para P1 (Pasada), el 80% de alumnos entregó
        for (Usuario alumno : alumnos) {
            if (Math.random() > 0.2) {
                crearEntrega(p1, alumno, true); // Calificada
            }
        }

        // Para P2 (Actual), el 30% de alumnos ya entregó
        for (Usuario alumno : alumnos) {
            if (Math.random() > 0.7) {
                crearEntrega(p2, alumno, false); // Sin calificar
            }
        }
    }

    private Practica crearPractica(Curso curso, String titulo, String jsonDesc, LocalDateTime fechaEntrega) {
        return Practica.builder()
                .curso(curso)
                .titulo(titulo)
                .descripcion(jsonDesc)
                .fechaEntrega(fechaEntrega)
                .build();
    }

    private void crearEntrega(Practica practica, Usuario alumno, boolean calificada) {
        EntregaPractica entrega = EntregaPractica.builder()
                .practica(practica)
                .alumno(alumno)
                .archivoUrl("https://example.com/archivo_entrega.zip")
                .comentario("Aquí está mi entrega profesor. Fue un reto interesante.")
                .fechaEntrega(practica.getFechaEntrega().minusHours((long) (Math.random() * 48))) // Entregado antes del
                                                                                                  // plazo
                .build();

        if (calificada) {
            double nota = 5 + (Math.random() * 5); // Nota entre 5 y 10
            entrega.setNota(Math.round(nota * 10.0) / 10.0);
            entrega.setComentarioProfesor(
                    nota >= 8 ? "¡Excelente trabajo!" : "Buen trabajo, pero revisa la identación.");
            entrega.setFechaCalificacion(LocalDateTime.now());
        }

        entregaPracticaRepository.save(entrega);
    }
}
