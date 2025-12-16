package com.infocurso.backend.dto;

import java.util.UUID;

public record RegistrarNotaDTO(
        UUID alumnoId,
        Double nota,
        String observaciones
) {
}
