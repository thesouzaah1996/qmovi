package com.qmovi.almoxarifado.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimentacao_estoque")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimentacao", nullable = false, length = 20)
    private TipoMovimentacaoEstoque tipoMovimentacao;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "saldo_anterior", nullable = false)
    private Integer saldoAnterior;

    @Column(name = "saldo_atual", nullable = false)
    private Integer saldoAtual;

    @Column(name = "autorizado_gestor", nullable = false)
    private Boolean autorizadoGestor;

    @Column(nullable = false, length = 120)
    private String conferente;

    @Column(length = 255)
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;
}
