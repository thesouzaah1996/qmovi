package com.qmovi.almoxarifado.service;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.mapper.ProdutoMapper;
import com.qmovi.almoxarifado.model.Produto;
import com.qmovi.almoxarifado.model.Setor;
import com.qmovi.almoxarifado.repository.ProdutoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
public class ProdutoServiceTest {

    @Mock
    private ProdutoRepository repository;

    @Mock
    private ProdutoMapper mapper;

    @InjectMocks
    private ProdutoService service;


    @Test
    @DisplayName("listarProdutos deve delegar para repository.findAll e retornar a lista")
    void listarProdutos_DeveRetornarListaDoRepository() {
        Produto produto = new Produto();
        produto.setId(1L);
        produto.setIdProduto("PARAF101");
        produto.setNotaFiscal("NF12345");
        produto.setSetor(Setor.ALMOXARIFADO);
        produto.setQuantidade(100);
        produto.setLocal("A1-01");
        produto.setResponsavelRecebimento("Carlos Souza");

        when(repository.findAll()).thenReturn(List.of(produto));

        List<Produto> resultado = service.listarProdutos();

        assertThat(resultado)
                .hasSize(1)
                .first()
                .satisfies(p -> {
                    assertThat(p.getId()).isEqualTo(1L);
                    assertThat(p.getIdProduto()).isEqualTo("PARAF101");
                    assertThat(p.getSetor()).isEqualTo(Setor.ALMOXARIFADO);
                });

        verify(repository, times(1)).findAll();
        verifyNoInteractions(mapper);
    }
}
