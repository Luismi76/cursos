package com.infocurso.backend.controller;

import com.infocurso.backend.dto.*;
import com.infocurso.backend.service.AdminService;
import com.infocurso.backend.service.AlumnoCursoService;
import com.infocurso.backend.service.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminController {

    @Autowired
    private AdminService adminService;
    @Autowired
    private CursoService cursoService;
    @Autowired
    private AlumnoCursoService alumnoCursoService;

    @PostMapping("/curso")
    public ResponseEntity<CursoDTO> crearCurso(@RequestBody CursoDTO dto) {
        return ResponseEntity.ok(adminService.crearCurso(dto));
    }

    @PostMapping("/curso/{cursoId}/profesor/{profesorId}")
    public void asignarProfesor(@PathVariable UUID cursoId, @PathVariable UUID profesorId) {
        adminService.asignarProfesor(cursoId, profesorId);
    }

    @PostMapping("/curso/{cursoId}/alumno/{alumnoId}")
    public void matricularAlumno(@PathVariable UUID cursoId, @PathVariable UUID alumnoId) {
        adminService.matricularAlumno(cursoId, alumnoId);
    }

    @PostMapping("/curso/{cursoId}/modulo")
    public CursoDTO agregarModulo(@PathVariable UUID cursoId, @RequestBody ModuloDTO dto) {
        return adminService.agregarModulo(cursoId, dto);
    }

    @PostMapping("/modulo/{moduloId}/unidad")
    public void agregarUnidad(@PathVariable UUID moduloId, @RequestBody UnidadFormativaDTO dto) {
        adminService.agregarUnidad(moduloId, dto);
    }

    @PostMapping("/curso/{cursoId}/evento")
    public void crearEventoAdmin(@PathVariable UUID cursoId, @RequestBody EventoCursoDTO dto) {
        adminService.crearEventoAdmin(cursoId, dto);
    }
    @GetMapping("/cursos")
    public List<CursoDTO> listarCursos() {
        return cursoService.getTodosLosCursos();
    }
    @GetMapping("/profesores")
    public ResponseEntity<List<UsuarioDTO>> listarProfesores() {
        return ResponseEntity.ok(adminService.listarProfesores());
    }
    @GetMapping("/curso/{cursoId}/alumnos-disponibles")
    public List<AlumnoDTO> listarAlumnosDisponiblesAdmin(@PathVariable UUID cursoId) {
        return alumnoCursoService.listarAlumnosNoInscritosEnCurso(cursoId)
                .stream()
                .map(AlumnoDTO::from)
                .toList();
    }

    @GetMapping("/curso/{cursoId}/alumnos")
    public List<AlumnoDTO> listarAlumnosCurso(@PathVariable UUID cursoId) {
        return alumnoCursoService.listarAlumnosPorCurso(cursoId)
                .stream()
                .map(AlumnoDTO::from)
                .toList();
    }
    @GetMapping("/curso/{cursoId}")
    public CursoDTO obtenerCurso(@PathVariable UUID cursoId) {
        return cursoService.getCursoDTO(cursoId);
    }

    @PutMapping("/modulo/{id}")
    public void editarModulo(@PathVariable UUID id, @RequestBody ModuloDTO dto) {
        adminService.editarModulo(id, dto);
    }

    @DeleteMapping("/modulo/{id}")
    public void eliminarModulo(@PathVariable UUID id) {
        adminService.eliminarModulo(id);
    }

    @PutMapping("/unidad/{id}")
    public void editarUnidad(@PathVariable UUID id, @RequestBody UnidadFormativaDTO dto) {
        adminService.editarUnidad(id, dto);
    }

    @DeleteMapping("/unidad/{id}")
    public void eliminarUnidad(@PathVariable UUID id) {
        adminService.eliminarUnidad(id);
    }
    @PostMapping("/admin/modulo/{moduloId}/unidad")
    public UnidadFormativaDTO crearUnidad(@PathVariable UUID moduloId, @RequestBody UnidadFormativaDTO unidad) {
        return adminService.agregarUnidad(moduloId, unidad);
    }
    @GetMapping("/unidad/{id}")
    public UnidadFormativaDTO obtenerUnidad(@PathVariable UUID id) {
        return adminService.obtenerUnidadPorId(id);
    }
    @PutMapping("/curso/{cursoId}/nombre")
    public ResponseEntity<?> actualizarNombreCurso(@PathVariable UUID cursoId, @RequestBody Map<String, String> body) {
        String nuevoNombre = body.get("nombre");
        cursoService.actualizarNombre(cursoId, nuevoNombre);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/curso/{cursoId}/descripcion")
    public ResponseEntity<?> actualizarDescripcionCurso(@PathVariable UUID cursoId, @RequestBody Map<String, String> body) {
        String nuevaDescripcion = body.get("descripcion");
        cursoService.actualizarDescripcion(cursoId, nuevaDescripcion);
        return ResponseEntity.ok().build();
    }

    // Gestión de usuarios

    @GetMapping("/usuarios")
    public List<UsuarioDTO> listarUsuarios() {
        return adminService.listarUsuarios();
    }

    @PostMapping("/usuarios")
    public ResponseEntity<UsuarioDTO> crearUsuario(@RequestBody CrearUsuarioDTO dto) {
        UsuarioDTO usuarioDto = new UsuarioDTO(null, dto.nombre(), dto.email(), dto.rol(), null);
        return ResponseEntity.ok(adminService.crearUsuario(usuarioDto, dto.password()));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(@PathVariable UUID id, @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(adminService.actualizarUsuario(id, dto));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable UUID id) {
        adminService.eliminarUsuario(id);
        return ResponseEntity.ok().build();
    }

}

