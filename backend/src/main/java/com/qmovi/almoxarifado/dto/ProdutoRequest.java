package com.qmovi.almoxarifado.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.qmovi.almoxarifado.model.Setor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoRequest(

        @NotBlank(message = "O campo 'id' é obrigatório")
        String id,

        @NotBlank(message = "O número da nota fiscal é obrigatório")
        @JsonProperty("nota_fiscal")
        String numeroNotaFiscal,

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O setor que esse produto pertence é obrigatório.")
        Setor setor,

        @NotBlank(message = "A unidade é obrigatória")
        String unidade,

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 0, message = "A quantidade deve ser positiva")
        Integer quantidade,

        @NotBlank(message = "O local é obrigatório")
        String local,

        @NotBlank(message = "O nome do conferente responsável pelo recebimento é obrigatório!")
        @JsonProperty("responsavel_recebimento")
        String responsavelRecebimento
) {}
