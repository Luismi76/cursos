package com.infocurso.backend.dto;

import com.infocurso.backend.entity.UnidadFormativa;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnidadFormativaDTO {

    private UUID id;
    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private UUID moduloId;

    public static UnidadFormativaDTO from(UnidadFormativa unidad) {
        if (unidad == null) return null;

        return UnidadFormativaDTO.builder()
                .id(unidad.getId())
                .nombre(unidad.getNombre())
                .fechaInicio(unidad.getFechaInicio())
                .fechaFin(unidad.getFechaFin())
                .moduloId(unidad.getModulo() != null ? unidad.getModulo().getId() : null)
                .build();
    }

    public UnidadFormativa toEntity() {
        UnidadFormativa unidad = new UnidadFormativa();
        unidad.setId(this.id);
        unidad.setNombre(this.nombre);
        unidad.setFechaInicio(this.fechaInicio);
        unidad.setFechaFin(this.fechaFin);
        // Asignar el módulo se debe hacer fuera con el servicio, no aquí si solo tienes el ID
        return unidad;
    }
}
