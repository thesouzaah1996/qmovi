package com.qmovi.almoxarifado.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProdutoResponse(

        @JsonProperty("id")
        String idProduto,

        @JsonProperty("nota_fiscal")
        String notaFiscal,

        String nome,

        String unidade,

        Integer quantidade,

        @JsonProperty("quantidade_total")
        Integer quantidadeTotal,

        String local,

        @JsonProperty("responsavel_recebimento")
        String responsavelRecebimento
) {
}
