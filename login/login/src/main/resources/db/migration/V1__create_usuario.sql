CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,

    nome    VARCHAR(150) NOT NULL,
    email   VARCHAR(255) NOT NULL UNIQUE,
    usuario VARCHAR(100) NOT NULL UNIQUE,

    senha   VARCHAR(255) NOT NULL,

    status  BOOLEAN NOT NULL DEFAULT FALSE,

    precisa_trocar_senha BOOLEAN NOT NULL DEFAULT TRUE,

    data_ultima_troca_senha TIMESTAMPTZ,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
