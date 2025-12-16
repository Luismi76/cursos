CREATE TABLE IF NOT EXISTS usuario (
    id uuid NOT NULL,
    nombre varchar(255),
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255),
    avatar_url varchar(255),
    rol varchar(255),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS curso (
    id uuid NOT NULL,
    nombre varchar(255),
    descripcion varchar(255),
    profesor_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT fk_curso_profesor FOREIGN KEY (profesor_id) REFERENCES usuario (id)
);

CREATE TABLE IF NOT EXISTS curso_alumnos (
    curso_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    PRIMARY KEY (curso_id, alumno_id),
    CONSTRAINT fk_ca_curso FOREIGN KEY (curso_id) REFERENCES curso (id),
    CONSTRAINT fk_ca_alumno FOREIGN KEY (alumno_id) REFERENCES usuario (id)
);

CREATE TABLE IF NOT EXISTS modulo (
    id uuid NOT NULL,
    nombre varchar(255),
    fecha_inicio date,
    fecha_fin date,
    curso_id uuid,
    orden_modulo int4,
    PRIMARY KEY (id),
    CONSTRAINT fk_modulo_curso FOREIGN KEY (curso_id) REFERENCES curso (id)
);

CREATE TABLE IF NOT EXISTS unidad_formativa (
    id uuid NOT NULL,
    nombre varchar(255),
    fecha_inicio date,
    fecha_fin date,
    modulo_id uuid,
    orden_unidad int4,
    PRIMARY KEY (id),
    CONSTRAINT fk_uf_modulo FOREIGN KEY (modulo_id) REFERENCES modulo (id)
);

CREATE TABLE IF NOT EXISTS practica (
    id uuid NOT NULL,
    titulo varchar(255),
    descripcion varchar(1000),
    fecha_entrega timestamp,
    curso_id uuid NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_practica_curso FOREIGN KEY (curso_id) REFERENCES curso (id)
);

CREATE TABLE IF NOT EXISTS entrega_practica (
    id uuid NOT NULL,
    comentario varchar(255),
    archivo_url varchar(255),
    fecha_entrega timestamp,
    nota float8,
    comentario_profesor varchar(1000),
    fecha_calificacion timestamp,
    practica_id uuid NOT NULL,
    alumno_id uuid NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_ep_practica FOREIGN KEY (practica_id) REFERENCES practica (id),
    CONSTRAINT fk_ep_alumno FOREIGN KEY (alumno_id) REFERENCES usuario (id)
);

CREATE TABLE IF NOT EXISTS evento_curso (
    id uuid NOT NULL,
    titulo varchar(255),
    descripcion varchar(255),
    tipo varchar(255),
    fecha date,
    visible_para varchar(255),
    curso_id uuid,
    autor_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT fk_evento_curso FOREIGN KEY (curso_id) REFERENCES curso (id),
    CONSTRAINT fk_evento_autor FOREIGN KEY (autor_id) REFERENCES usuario (id)
);

CREATE TABLE IF NOT EXISTS wiki_curso (
    id uuid NOT NULL,
    titulo varchar(255),
    curso_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT fk_wiki_curso FOREIGN KEY (curso_id) REFERENCES curso (id)
);

CREATE TABLE IF NOT EXISTS aportacion_wiki (
    id uuid NOT NULL,
    contenido text,
    fecha timestamp,
    wiki_id uuid,
    autor_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT fk_aportacion_wiki FOREIGN KEY (wiki_id) REFERENCES wiki_curso (id),
    CONSTRAINT fk_aportacion_autor FOREIGN KEY (autor_id) REFERENCES usuario (id)
);

-- Mensajes (simplificado para evitar ciclos en caso de duda, pero mejor incluirlo si existe)
CREATE TABLE IF NOT EXISTS mensaje_curso (
    id uuid NOT NULL,
    contenido varchar(255),
    fecha_envio timestamp,
    curso_id uuid,
    autor_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT fk_mensaje_curso FOREIGN KEY (curso_id) REFERENCES curso (id),
    CONSTRAINT fk_mensaje_autor FOREIGN KEY (autor_id) REFERENCES usuario (id)
);
