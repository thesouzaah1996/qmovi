package com.qmovi.almoxarifado.controller;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.service.ProdutoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/almoxarifado/produto")
@CrossOrigin("*")
@Tag(name = "Produtos - Almoxarifado")
public class ProdutoController {

    private final ProdutoService service;

    @Autowired
    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping("/listar")
    public List<Produto> listarProdutos() {
        return service.listarProdutos();
    }

    @PostMapping("/criar")
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse response = service.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponse> editar(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoRequest request) {

     ProdutoResponse response = service.atualizar(id, request);
     return ResponseEntity.ok(response);
    }
}

