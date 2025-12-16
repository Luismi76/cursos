CREATE TABLE IF NOT EXISTS alumno_curso (
    id uuid NOT NULL,
    curso_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_ac_curso FOREIGN KEY (curso_id) REFERENCES curso (id),
    CONSTRAINT fk_ac_alumno FOREIGN KEY (alumno_id) REFERENCES usuario (id)
);
