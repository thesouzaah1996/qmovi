CREATE TABLE IF NOT EXISTS produto (
    id BIGSERIAL PRIMARY KEY,
    id_produto VARCHAR(255),
    nome VARCHAR(255),
    unidade VARCHAR(100),
    quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    quantidade_total INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_total >= 0),
    local VARCHAR(150),
    minimo INTEGER NOT NULL DEFAULT 0 CHECK (minimo >= 0)
);
