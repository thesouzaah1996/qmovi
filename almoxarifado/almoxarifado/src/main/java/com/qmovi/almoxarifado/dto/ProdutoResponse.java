package com.qmovi.almoxarifado.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.qmovi.almoxarifado.model.Setor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoResponse(

        @JsonProperty("id")
        String idProduto,

        String notaFiscal,

        String nome,

        Setor setor,

        String unidade,

        Integer quantidade,

        String local,

        String responsavelRecebimento
) {
}
