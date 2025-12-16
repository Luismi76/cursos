package com.infocurso.backend.dto;

import com.infocurso.backend.entity.Modulo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloDTO {
    private UUID id;
    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private List<UnidadFormativaDTO> unidades;

    public static ModuloDTO from(Modulo modulo) {
        if (modulo == null) {
            return null;
        }
        return ModuloDTO.builder()
                .id(modulo.getId())
                .nombre(modulo.getNombre())
                .fechaInicio(modulo.getFechaInicio())
                .fechaFin(modulo.getFechaFin())
                .unidades(modulo.getUnidades() != null
                        ? modulo.getUnidades().stream()
                        .filter(Objects::nonNull) // <- Añadir esto
                        .map(UnidadFormativaDTO::from)
                        .collect(Collectors.toList())
                        : List.of())
                .build();
    }

}
