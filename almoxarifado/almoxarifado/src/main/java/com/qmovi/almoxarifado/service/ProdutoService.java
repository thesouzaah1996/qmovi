package com.qmovi.almoxarifado.service;

import com.qmovi.almoxarifado.dto.BaixaEstoqueRequest;
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

    @Transactional
    public void excluir(Long id) {
        Produto existente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produto não encontrado com id: " + id
                ));

        repository.delete(existente);
    }

    @Transactional
    public ProdutoResponse baixarEstoque(BaixaEstoqueRequest request) {

        if (Boolean.FALSE.equals(request.autorizadoGestor())) {
            throw new BadRequestException(
                    "Baixa não autorizada. Para concluir, é necessário a altorização do gestor responsável."
            );
        }

        Produto produto = repository.findByIdProduto(request.idProduto())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produto não encontrado com id de produto: " + request.idProduto()
                ));

        if (request.quantidadeBaixa() <= 0) {
            throw new BadRequestException("A quantidade a dar baixa deve ser maior que zero.");
        }

        if (produto.getQuantidade() < request.quantidadeBaixa()) {
            throw new BadRequestException(
                    "Quantidade em estoque insuficiente para a baixa solicitada"
            );
        }

        int novaQuantidade = produto.getQuantidade() - request.quantidadeBaixa();
        produto.setQuantidade(novaQuantidade);

        Produto salvo = repository.save(produto);
        return mapper.toResponse(salvo);
    }
}

