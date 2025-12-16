package com.infocurso.backend.repository;

import com.infocurso.backend.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByEmisorIdAndReceptorIdOrReceptorIdAndEmisorIdOrderByFechaEnvio(
            UUID emisorId, UUID receptorId, UUID receptorId2, UUID emisorId2
    );

    @Query("""
    SELECT m FROM Mensaje m 
    WHERE (m.emisor.id = :emisorId AND m.receptor.id = :receptorId)
       OR (m.emisor.id = :receptorId AND m.receptor.id = :emisorId)
    ORDER BY m.fechaEnvio
""")
    List<Mensaje> obtenerConversacion(UUID emisorId, UUID receptorId);
}
