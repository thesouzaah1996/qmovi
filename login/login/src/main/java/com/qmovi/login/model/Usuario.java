package com.qmovi.login.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    @NotBlank
    private String email;

    @NotBlank
    private String usuario;

    @NotBlank
    @JsonIgnore
    private String senha;

    private Boolean status;

    @Column(name = "precisa_trocar_senha")
    private Boolean precisaTrocarSenha;

    @Column(name = "data_ultima_troca_senha")
    private LocalDateTime dataUltimaTrocaSenha;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

}
