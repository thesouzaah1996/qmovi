package com.qmovi.backend.service;

import com.qmovi.backend.model.Produto;
import com.qmovi.backend.repository.ProdutoRepository;
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

    public Produto addProduto(Produto produto) {
        return repository.save(produto);
    }
}
