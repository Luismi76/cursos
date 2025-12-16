package com.infocurso.backend.service;

import com.infocurso.backend.entity.Usuario;
import com.infocurso.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.io.FilenameUtils;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public Optional<Usuario> getByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario getById(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    public String actualizarAvatar(UUID usuarioId, MultipartFile archivo) throws IOException {
        // Creamos nombre único
        String nombreArchivo = generarNombreUnico(archivo.getOriginalFilename());
        String extension = FilenameUtils.getExtension(nombreArchivo);
        Path destino = Paths.get("uploads/avatars", nombreArchivo);

        // Aseguramos que la carpeta exista
        Files.createDirectories(destino.getParent());

        // Procesamos la imagen: redimensionamos y comprimimos (calidad 80%)
        Thumbnails.of(archivo.getInputStream())
                .size(300, 300) // Puedes ajustar el tamaño según lo que necesites
                .outputFormat(extension) // Conserva el formato original (png, jpg…)
                .outputQuality(0.8f)     // Calidad (1.0 = sin compresión, 0.0 = máxima compresión)
                .toFile(destino.toFile());

        // Guardamos la ruta en el usuario
        Usuario usuario = getById(usuarioId);
        usuario.setAvatarUrl("/uploads/avatars/" + nombreArchivo);
        usuarioRepository.save(usuario);

        return nombreArchivo;
    }
    private String generarNombreUnico(String originalFilename) {
        String extension = "";

        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        String nombreUnico = UUID.randomUUID().toString();
        return nombreUnico + extension;
    }


    public Usuario getUsuarioById(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}


