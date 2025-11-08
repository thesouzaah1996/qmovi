package com.qmovi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoRequest(

        @NotBlank(message = "O campo 'id' é obrigatório")
        String id,

        @NotBlank(message = "O nome é obrigatório")
        String nome,

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
