package com.qmovi.almoxarifado.controller;

import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
//@RequestMapping("/api/almoxarifado/produto")
public class ProdutoController {

    private static ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping("/")
    public List<Produto> mostrarProdutos() {
        return service.listarProdutos();
    }

    @PostMapping
    public ResponseEntity<Produto> novoProduto(Produto produto) {
        Produto novoProduto = service.addProduto(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }
}
