package com.qmovi.almoxarifado.service;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    private static ProdutoRepository repository;

    public List<Produto> listarProdutos() {
        return repository.findAll();
    }

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    public Produto addProduto(ProdutoRequest produtoRequest) {
        return repository.save(produto);
    }
}
