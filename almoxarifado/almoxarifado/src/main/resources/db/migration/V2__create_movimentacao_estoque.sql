CREATE TABLE IF NOT EXISTS movimentacao_estoque (
    id                  BIGSERIAL PRIMARY KEY,
    produto_id          BIGINT       NOT NULL,
    tipo_movimentacao   VARCHAR(20)  NOT NULL,
    quantidade          INTEGER      NOT NULL,
    saldo_anterior      INTEGER      NOT NULL,
    saldo_atual         INTEGER      NOT NULL,
    autorizado_gestor   BOOLEAN      NOT NULL,
    conferente          VARCHAR(120) NOT NULL,
    observacao          VARCHAR(255),
    criado_em           TIMESTAMP    NOT NULL,

    CONSTRAINT fk_movimentacao_produto
        FOREIGN KEY (produto_id) REFERENCES produto (id)
);
