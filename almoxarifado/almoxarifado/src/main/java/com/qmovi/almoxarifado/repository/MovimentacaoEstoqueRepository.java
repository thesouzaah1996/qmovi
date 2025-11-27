package com.qmovi.almoxarifado.repository;

import com.qmovi.almoxarifado.model.MovimentacaoEstoque;
import com.qmovi.almoxarifado.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    void deleteByProduto(Produto produto);
}
