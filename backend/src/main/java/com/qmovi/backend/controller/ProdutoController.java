package com.qmovi.backend.controller;

import com.qmovi.backend.model.Produto;
import com.qmovi.backend.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/almoxarifado/produto")
public class ProdutoController {

    private static ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Produto> novoProduto(Produto produto) {
        Produto novoProduto = service.addProduto(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }
}
