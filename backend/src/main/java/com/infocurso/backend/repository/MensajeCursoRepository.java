package com.infocurso.backend.repository;

import com.infocurso.backend.entity.MensajeCurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MensajeCursoRepository extends JpaRepository<MensajeCurso, UUID> {

    // ✅ Último mensaje del curso (por fecha)
    Optional<MensajeCurso> findTopByCursoIdOrderByFechaEnvioDesc(UUID cursoId);

    // ✅ Mensajes posteriores a una fecha, emitidos por otros usuarios
    int countByCursoIdAndFechaEnvioAfterAndEmisorIdNot(UUID cursoId, LocalDateTime fecha, UUID emisorId);

    // ✅ Si nunca ha leído, contar todos los mensajes de otros
    int countByCursoIdAndEmisorIdNot(UUID cursoId, UUID emisorId);

    // ✅ Obtener mensajes de otros usuarios (para read receipts)
    List<MensajeCurso> findByCursoIdAndEmisorIdNot(UUID cursoId, UUID emisorId);

    // ✅ Obtener mensajes posteriores a una fecha de otros usuarios
    List<MensajeCurso> findByCursoIdAndFechaEnvioAfterAndEmisorIdNot(
            UUID cursoId, LocalDateTime fecha, UUID emisorId);

    // (opcional) Obtener todos los mensajes de un curso ordenados
    List<MensajeCurso> findAllByCursoIdOrderByFechaEnvioAsc(UUID cursoId);
}
