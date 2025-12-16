package com.infocurso.backend.controller;

import com.infocurso.backend.dto.EntregaPracticaDTO;
import com.infocurso.backend.entity.Practica;
import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.service.EntregaPracticaService;
import com.infocurso.backend.service.PracticaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/alumno")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ALUMNO')")
public class EntregaPracticaController {

    private final EntregaPracticaService entregaService;
    private final PracticaService practicaService;

    // Entregar o actualizar una práctica
    @PostMapping("/practica/{practicaId}/entregar")
    @Transactional
    public ResponseEntity<EntregaPracticaDTO> entregarPractica(
            @PathVariable UUID practicaId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario alumno) {
        String archivoUrl = body.get("archivoUrl");
        String comentario = body.getOrDefault("comentario", "");

        Practica practica = practicaService.getPracticaById(practicaId);

        var entrega = entregaService.entregarPractica(alumno, practica, archivoUrl, comentario);
        return ResponseEntity.ok(EntregaPracticaDTO.from(entrega));
    }

    // Listar todas las entregas de una práctica (uso interno o para profesor)
    @GetMapping("/practica/{practicaId}/entregas")
    public List<EntregaPracticaDTO> listarEntregasDePractica(@PathVariable UUID practicaId) {
        return entregaService.getEntregasPorPractica(practicaId)
                .stream()
                .map(EntregaPracticaDTO::from)
                .toList();
    }

    @Value("${app.base-url}")
    private String baseUrl;

    @PostMapping("/practica/{practicaId}/archivo")
    public ResponseEntity<Map<String, String>> subirArchivoEntrega(
            @PathVariable UUID practicaId,
            @RequestParam("file") MultipartFile archivo,
            @AuthenticationPrincipal Usuario principal) throws IOException {
        Path uploadsDir = Paths.get("uploads");
        Files.createDirectories(uploadsDir); // ← crea si no existe

        String nombreArchivo = UUID.randomUUID() + "-" + archivo.getOriginalFilename();
        Path destino = uploadsDir.resolve(nombreArchivo);

        try (var inputStream = archivo.getInputStream()) {
            Files.copy(inputStream, destino);
        }

        // ✅ Construye URL absoluta usando baseUrl
        String url = baseUrl + "/archivos/" + nombreArchivo;

        return ResponseEntity.ok(Map.of("archivoUrl", url));
    }
}
