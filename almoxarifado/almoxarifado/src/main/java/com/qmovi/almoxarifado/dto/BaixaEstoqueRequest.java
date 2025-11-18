package com.qmovi.almoxarifado.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BaixaEstoqueRequest(
        @NotBlank(message = "o ID do produto é obrigatório")
        @JsonProperty("id_produto")
        String idProduto,

        @NotNull(message = "A quantidade a dar baixa é obrigatório")
        @Min(value = 1, message = "A quantidade a dar baixa deve ser no mínimo 1")
        @JsonProperty("quantidade_baixa")
        Integer quantidadeBaixa,

        @NotNull(message = "É obrigatório informar se houve autorização do gestor")
        @JsonProperty("autorizado_gestor")
        Boolean autorizadoGestor,

        @NotBlank(message = "O nome do conferente é obrigatório")
        String conferente
) {}
