-- V1__create_usuario.sql

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.usuario (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    permissao VARCHAR(50) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT FALSE,
    precisa_trocar_senha BOOLEAN NOT NULL DEFAULT TRUE,
    data_ultima_troca_senha TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3) índices também no schema public
CREATE INDEX IF NOT EXISTS idx_usuario_email ON public.usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_usuario ON public.usuario(usuario);
CREATE INDEX IF NOT EXISTS idx_usuario_status ON public.usuario(status);
