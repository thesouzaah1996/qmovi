package com.qmovi.almoxarifado.mapper;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.model.Setor;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-13T11:06:34-0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class ProdutoMapperImpl implements ProdutoMapper {

    @Override
    public Produto toEntity(ProdutoRequest request) {
        if ( request == null ) {
            return null;
        }

        Produto produto = new Produto();

        produto.setIdProduto( request.idProduto() );
        produto.setNotaFiscal( request.notaFiscal() );
        produto.setNome( request.nome() );
        produto.setUnidade( request.unidade() );
        produto.setQuantidade( request.quantidade() );
        produto.setLocal( request.local() );
        produto.setResponsavelRecebimento( request.responsavelRecebimento() );

        return produto;
    }

    @Override
    public ProdutoResponse toResponse(Produto produto) {
        if ( produto == null ) {
            return null;
        }

        String idProduto = null;
        String notaFiscal = null;
        String nome = null;
        String unidade = null;
        Integer quantidade = null;
        String local = null;
        String responsavelRecebimento = null;

        idProduto = produto.getIdProduto();
        notaFiscal = produto.getNotaFiscal();
        nome = produto.getNome();
        unidade = produto.getUnidade();
        quantidade = produto.getQuantidade();
        local = produto.getLocal();
        responsavelRecebimento = produto.getResponsavelRecebimento();

        Setor setor = null;

        ProdutoResponse produtoResponse = new ProdutoResponse( idProduto, notaFiscal, nome, setor, unidade, quantidade, local, responsavelRecebimento );

        return produtoResponse;
    }

    @Override
    public void updateFromRequest(ProdutoRequest request, Produto entity) {
        if ( request == null ) {
            return;
        }

        entity.setIdProduto( request.idProduto() );
        entity.setNotaFiscal( request.notaFiscal() );
        entity.setNome( request.nome() );
        entity.setUnidade( request.unidade() );
        entity.setQuantidade( request.quantidade() );
        entity.setLocal( request.local() );
        entity.setResponsavelRecebimento( request.responsavelRecebimento() );
    }
}
