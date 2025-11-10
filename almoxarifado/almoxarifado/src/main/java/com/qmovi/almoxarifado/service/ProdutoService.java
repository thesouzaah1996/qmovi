package com.qmovi.almoxarifado.service;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.mapper.ProdutoMapper;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    @Autowired
    private final ProdutoRepository repository;

    @Autowired
    private final ProdutoMapper mapper;


    public List<Produto> listarProdutos() {
        return repository.findAll();
    }

    public ProdutoResponse criar(ProdutoRequest request) {
        Produto produto = mapper.toEntity(request);
        Produto salvo = repository.save(produto);
        return mapper.toResponse(salvo);
    }
}

