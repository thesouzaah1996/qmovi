package com.qmovi.almoxarifado.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_produto", nullable = false, unique = true)
    private String idProduto;

    @Column(name = "nota_fiscal", nullable = false)
    private String notaFiscal;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String unidade;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private String local;

    @Column(name = "responsavel_recebimento", nullable = false)
    private String responsavelRecebimento;
}
