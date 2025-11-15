package com.qmovi.almoxarifado.service;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.exception.BadRequestException;
import com.qmovi.almoxarifado.exception.ResourceNotFoundException;
import com.qmovi.almoxarifado.mapper.ProdutoMapper;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {

        Produto existente = repository.findById(id)
                .orElseThrow(() ->new ResourceNotFoundException(
                        "Produto não encontrado com id: " + id
                ));

        if (request.quantidade() < 0) {
            throw new BadRequestException("A quantidade não pode ser negativa");
        }

        mapper.updateFromRequest(request, existente);

        Produto salvo = repository.save(existente);

        return mapper.toResponse(salvo);
    }
}

