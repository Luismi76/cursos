package com.infocurso.backend.dto;

import java.time.LocalDateTime;

public record CrearPracticaDTO(
        String titulo,
        Object descripcion,
        LocalDateTime fechaEntrega
) {}

