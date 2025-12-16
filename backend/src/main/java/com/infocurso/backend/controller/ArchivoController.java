package com.infocurso.backend.controller;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/archivos")
public class ArchivoController {

    private final String rutaBase = "uploads"; // puedes hacerla configurable

    @PostMapping("/imagen")
    public Map<String, Object> subirImagen(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo vacío");
        }

        String nombreArchivo = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destino = Paths.get(rutaBase).resolve(nombreArchivo);
        Files.createDirectories(destino.getParent());
        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        // ⚠️ IMPORTANTE: URL ABSOLUTA
        String urlPublica = "http://localhost:8080/archivos/" + nombreArchivo;

        return Map.of("url", urlPublica);
    }
}

