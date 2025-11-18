package com.qmovi.almoxarifado.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.qmovi.almoxarifado.model.Setor;

public record ProdutoResponse(

        @JsonProperty("id")
        String idProduto,

        @JsonProperty("nota_fiscal")
        String notaFiscal,

        String nome,

        Setor setor,

        String unidade,

        Integer quantidade,

        String local,

        @JsonProperty("responsavel_recebimento")
        String responsavelRecebimento
) {
}
