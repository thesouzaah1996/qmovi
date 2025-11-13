-- V1__create_produto.sql
CREATE TABLE IF NOT EXISTS produto (
    id BIGSERIAL PRIMARY KEY,
    id_produto               VARCHAR(50)  NOT NULL,
    nota_fiscal              VARCHAR(50)  NOT NULL,
    nome                     VARCHAR(120) NOT NULL,
    unidade                  VARCHAR(20)  NOT NULL,
    quantidade               INTEGER      NOT NULL,
    local                    VARCHAR(120) NOT NULL,
    responsavel_recebimento  VARCHAR(120) NOT NULL
);
