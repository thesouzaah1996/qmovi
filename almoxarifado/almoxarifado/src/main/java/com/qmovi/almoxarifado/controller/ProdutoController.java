package com.qmovi.almoxarifado.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.qmovi.almoxarifado.dto.BaixaEstoqueRequest;
import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.service.ProdutoService;

import java.util.List;

@RestController
@RequestMapping("/api/almoxarifado/produto")
@CrossOrigin("*")
@Tag(name = "Produtos - Almoxarifado")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService service;

    @GetMapping("/listar")
    public ResponseEntity<List<Produto>> listarProdutos() {
        return ResponseEntity.ok(service.listarProdutos());
    }

    @PostMapping("/criar")
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse response = service.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/editar/{idProduto}")
    public ResponseEntity<ProdutoResponse> editar(@PathVariable String idProduto, @Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse response = service.atualizar(idProduto, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remover/{idProduto}")
    public ResponseEntity<Void> excluir(@PathVariable String idProduto) {
        service.excluir(idProduto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/baixa-estoque")
    public ResponseEntity<ProdutoResponse> baixarEstoque(@Valid @RequestBody BaixaEstoqueRequest request) {
        ProdutoResponse response = service.baixarEstoque(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProdutoResponse>> buscar(@RequestParam String termo) {
        return ResponseEntity.ok(service.buscar(termo));
    }

    @GetMapping("/exportar-csv")
    public ResponseEntity<String> exportarCsv() {
        String csv = service.exportarCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=produtos.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csv);
    }

    @GetMapping("/relatorio-produtos-pdf")
    public ResponseEntity<byte[]> relatorioProdutosPdf() {
        byte[] pdf = service.gerarRelatorioProdutosPdf();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-estoque.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/relatorio-produtos")
    public ResponseEntity<List<ProdutoResponse>> relatorioProdutos() {
        return ResponseEntity.ok(service.listarTodosComoResponse());
    }
}
