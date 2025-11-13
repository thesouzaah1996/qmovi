package com.qmovi.almoxarifado.repository;

import com.qmovi.almoxarifado.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    Optional<Produto> findByIdProduto(String idProduto);
    boolean existsByIdProduto(String idProduto);
}