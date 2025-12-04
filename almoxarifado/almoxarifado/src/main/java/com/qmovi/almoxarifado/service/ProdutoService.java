package com.qmovi.almoxarifado.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.qmovi.almoxarifado.dto.BaixaEstoqueRequest;
import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.exception.BadRequestException;
import com.qmovi.almoxarifado.exception.ResourceNotFoundException;
import com.qmovi.almoxarifado.mapper.ProdutoMapper;
import com.qmovi.almoxarifado.model.MovimentacaoEstoque;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.model.TipoMovimentacaoEstoque;
import com.qmovi.almoxarifado.repository.MovimentacaoEstoqueRepository;
import com.qmovi.almoxarifado.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ProdutoMapper mapper;
    private final MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;

    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {

        if (request.quantidade() < 0) {
            throw new BadRequestException("A quantidade não pode ser negativa");
        }

        try {
            Produto produto;
            int saldoAnterior;
            int saldoAtual;

            var existenteOpt = produtoRepository.findByIdProduto(request.idProduto());

            if (existenteOpt.isPresent()) {
                Produto existente = existenteOpt.get();
                saldoAnterior = existente.getQuantidade() != null ? existente.getQuantidade() : 0;
                saldoAtual = saldoAnterior + request.quantidade();
                existente.setQuantidade(saldoAtual);
                aplicarDadosCadastrais(request, existente);
                produto = existente;
            } else {
                Produto novo = mapper.toEntity(request);
                saldoAnterior = 0;
                saldoAtual = request.quantidade();
                novo.setQuantidade(saldoAtual);
                aplicarDadosCadastrais(request, novo);
                produto = novo;
            }

            Produto salvo = produtoRepository.save(produto);

            registrarMovimentacao(
                    salvo,
                    request.quantidade(),
                    saldoAnterior,
                    saldoAtual,
                    TipoMovimentacaoEstoque.ENTRADA,
                    true,
                    request.responsavelRecebimento(),
                    "Entrada de estoque via cadastro de produto"
            );

            return mapper.toResponse(salvo);

        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Erro interno ao criar produto. Tente novamente ou contate o suporte.");
        }
    }

    @Transactional
    public ProdutoResponse atualizar(String idProduto, ProdutoRequest request) {

        if (request.quantidade() < 0) {
            throw new BadRequestException("A quantidade não pode ser negativa");
        }

        try {
            Produto existente = produtoRepository.findByIdProduto(idProduto)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Produto não encontrado com idProduto: " + idProduto)
                    );

            int saldoAnterior = existente.getQuantidade() != null ? existente.getQuantidade() : 0;

            mapper.updateFromRequest(request, existente);

            Produto salvo = produtoRepository.save(existente);

            int saldoAtual = salvo.getQuantidade() != null ? salvo.getQuantidade() : 0;

            if (saldoAtual != saldoAnterior) {
                int quantidadeMovimentada = Math.abs(saldoAtual - saldoAnterior);

                String observacao = saldoAtual > saldoAnterior
                        ? "Ajuste de produto (aumento de estoque)."
                        : "Ajuste de produto (redução de estoque).";

                registrarMovimentacao(
                        salvo,
                        quantidadeMovimentada,
                        saldoAnterior,
                        saldoAtual,
                        TipoMovimentacaoEstoque.AJUSTE,
                        true,
                        request.responsavelRecebimento(),
                        observacao
                );
            }

            return mapper.toResponse(salvo);
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Erro interno ao atualizar produto. Por favor, entre em contato com o suporte.");
        }
    }


    @Transactional
    public void excluir(String idProduto) {

        try {
            Produto produto = produtoRepository.findByIdProduto(idProduto)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Produto não encontrado com idProduto: " + idProduto)
                    );

            movimentacaoEstoqueRepository.deleteByProduto(produto);
            produtoRepository.delete(produto);

        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException(
                    "Não é possível excluir o produto porque existem movimentações de estoque vinculadas a ele."
            );
        } catch (Exception e) {
            throw new BadRequestException("Erro interno ao excluir o produto. Tente novamente ou contate o suporte.");
        }
    }

@Transactional
public ProdutoResponse baixarEstoque(BaixaEstoqueRequest request) {

    try {
        Produto produto = produtoRepository.findByIdProduto(request.idProduto())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Produto não encontrado com id de produto: " + request.idProduto()
                        )
                );

        String conferenteNormalizado;

        if (request.conferente() == null || request.conferente().trim().isEmpty()) {
            // não veio conferente na requisição → mantém o que já está no produto
            conferenteNormalizado = produto.getResponsavelRecebimento();

            if (conferenteNormalizado == null || conferenteNormalizado.trim().isEmpty()) {
                conferenteNormalizado = "Conferente não informado";
            }
        } else {
            conferenteNormalizado = request.conferente().trim();
            produto.setResponsavelRecebimento(conferenteNormalizado);
        }

        if (request.quantidadeBaixa() == null || request.quantidadeBaixa() <= 0) {
            throw new BadRequestException("A quantidade a dar baixa deve ser maior que zero.");
        }

        boolean autorizadoGestor = Boolean.TRUE.equals(request.autorizadoGestor());

        if (!autorizadoGestor) {

            registrarMovimentacao(
                    produto,
                    0,
                    produto.getQuantidade(),
                    produto.getQuantidade(),
                    TipoMovimentacaoEstoque.SAIDA,
                    false,
                    conferenteNormalizado,
                    "Tentativa de baixa não autorizada pelo gestor"
            );

            Produto semBaixa = produtoRepository.save(produto);
            return mapper.toResponse(semBaixa);
        }

        if (produto.getQuantidade() < request.quantidadeBaixa()) {
            throw new BadRequestException(
                    "Quantidade em estoque insuficiente para a baixa solicitada."
            );
        }

        int saldoAnterior = produto.getQuantidade();
        int saldoAtual = saldoAnterior - request.quantidadeBaixa();
        produto.setQuantidade(saldoAtual);

        Produto salvo = produtoRepository.save(produto);

        registrarMovimentacao(
                salvo,
                request.quantidadeBaixa(),
                saldoAnterior,
                saldoAtual,
                TipoMovimentacaoEstoque.SAIDA,
                true,
                conferenteNormalizado,
                "Baixa de estoque via módulo Almoxarifado"
        );

        return mapper.toResponse(salvo);

    } catch (BadRequestException | ResourceNotFoundException e) {
        throw e;
    } catch (Exception e) {
        throw new BadRequestException(
                "Erro interno ao baixar o estoque. Tente novamente ou contate o suporte."
        );
    }
}




    public List<ProdutoResponse> buscar(String termo) {
        if (termo == null || termo.isBlank()) {
            throw new BadRequestException("O termo de busca não pode estar vazio.");
        }

        try {
            List<Produto> encontrados = produtoRepository
                    .findByIdProdutoContainingIgnoreCaseOrNomeContainingIgnoreCase(termo, termo);

            if (encontrados.isEmpty()) {
                throw new ResourceNotFoundException("Nenhum produto encontrado para termo: " + termo);
            }

            return encontrados.stream()
                    .map(mapper::toResponse)
                    .toList();
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Erro interno ao buscar produtos. Tente novamente ou contate o suporte.");
        }
    }

    public List<ProdutoResponse> listarTodosComoResponse() {
        return produtoRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public String exportarCsv() {
        try {
            List<ProdutoResponse> produtos = listarTodosComoResponse();

            StringBuilder sb = new StringBuilder();
            sb.append("id;notaFiscal;nome;setor;unidade;quantidade;local;responsavelRecebimento\n");

            for (ProdutoResponse p : produtos) {
                sb.append(p.idProduto()).append(';')
                        .append(p.notaFiscal()).append(';')
                        .append(p.nome()).append(';')
                        .append(p.setor()).append(';')
                        .append(p.unidade()).append(';')
                        .append(p.quantidade()).append(';')
                        .append(p.local()).append(';')
                        .append(p.responsavelRecebimento())
                        .append('\n');
            }

            return sb.toString();
        } catch (Exception e) {
            throw new BadRequestException("Erro ao exportar CSV de produtos. Tente novamente ou contate o suporte.");
        }
    }

    public byte[] gerarRelatorioProdutosPdf() {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            List<ProdutoResponse> produtos = listarTodosComoResponse();

            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.DARK_GRAY);
            Paragraph titulo = new Paragraph("Relatório de Estoque - Almoxarifado Qmovi", titleFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(10f);
            document.add(titulo);

            Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.GRAY);
            String geradoEm = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            Paragraph info = new Paragraph("Gerado em: " + geradoEm, subtitleFont);
            info.setAlignment(Element.ALIGN_RIGHT);
            info.setSpacingAfter(15f);
            document.add(info);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{12f, 25f, 12f, 10f, 10f, 16f, 15f});

            Font headerFont = new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE);
            Color headerBg = new Color(0x12, 0x4E, 0x96);

            addHeaderCell(table, "ID", headerFont, headerBg);
            addHeaderCell(table, "Nome", headerFont, headerBg);
            addHeaderCell(table, "Setor", headerFont, headerBg);
            addHeaderCell(table, "Unid.", headerFont, headerBg);
            addHeaderCell(table, "Qtd.", headerFont, headerBg);
            addHeaderCell(table, "Local", headerFont, headerBg);
            addHeaderCell(table, "Resp. Recebimento", headerFont, headerBg);

            Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);
            boolean zebra = false;
            Color zebraColor = new Color(0xF5, 0xF5, 0xF5);

            for (ProdutoResponse p : produtos) {
                Color bg = zebra ? zebraColor : Color.WHITE;
                zebra = !zebra;

                addBodyCell(table, p.idProduto(), cellFont, bg, Element.ALIGN_LEFT);
                addBodyCell(table, p.nome(), cellFont, bg, Element.ALIGN_LEFT);
                addBodyCell(table, p.setor() != null ? p.setor().name() : "-", cellFont, bg, Element.ALIGN_LEFT);
                addBodyCell(table, p.unidade(), cellFont, bg, Element.ALIGN_CENTER);
                addBodyCell(table, String.valueOf(p.quantidade()), cellFont, bg, Element.ALIGN_RIGHT);
                addBodyCell(table, p.local(), cellFont, bg, Element.ALIGN_LEFT);
                addBodyCell(table, p.responsavelRecebimento(), cellFont, bg, Element.ALIGN_LEFT);
            }

            document.add(table);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new BadRequestException(
                    "Erro ao gerar o PDF de relatório de produtos. Tente novamente ou contate o suporte."
            );
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(bg);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(bg);
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private void aplicarDadosCadastrais(ProdutoRequest request, Produto produto) {
        produto.setIdProduto(request.idProduto());
        produto.setNotaFiscal(request.notaFiscal());
        produto.setNome(request.nome());
        produto.setSetor(request.setor());
        produto.setUnidade(request.unidade());
        produto.setLocal(request.local());
        produto.setResponsavelRecebimento(request.responsavelRecebimento());
    }

    private void registrarMovimentacao(Produto produto,
                                       int quantidade,
                                       int saldoAnterior,
                                       int saldoAtual,
                                       TipoMovimentacaoEstoque tipo,
                                       Boolean autorizadoGestor,
                                       String conferente,
                                       String observacao) {

        MovimentacaoEstoque mov = new MovimentacaoEstoque();
        mov.setProduto(produto);
        mov.setTipoMovimentacao(tipo);
        mov.setQuantidade(quantidade);
        mov.setSaldoAnterior(saldoAnterior);
        mov.setSaldoAtual(saldoAtual);
        mov.setAutorizadoGestor(autorizadoGestor);
        mov.setConferente(conferente);
        mov.setObservacao(observacao);
        mov.setCriadoEm(LocalDateTime.now());

        movimentacaoEstoqueRepository.save(mov);
    }
}
