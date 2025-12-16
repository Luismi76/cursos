package com.infocurso.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntregasAgrupadasDTO {
    private List<EntregaPracticaDTO> entregadas;
    private List<AlumnoDTO> pendientes;
    private List<AlumnoDTO> fueraDePlazo;
}
