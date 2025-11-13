package com.qmovi.almoxarifado.mapper;

import com.qmovi.almoxarifado.dto.ProdutoRequest;
import com.qmovi.almoxarifado.dto.ProdutoResponse;
import com.qmovi.almoxarifado.model.Produto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProdutoMapper {

    @Mapping(target = "id", ignore = true)
    Produto toEntity(ProdutoRequest request);

    ProdutoResponse toResponse(Produto produto);

    void updateFromRequest(ProdutoRequest request, @MappingTarget Produto entity);
}
