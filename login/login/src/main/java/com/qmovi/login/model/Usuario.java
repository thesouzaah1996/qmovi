package com.qmovi.login.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario", schema = "public")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(nullable = false, length = 100, unique = true)
    private String usuario;

    @Column(nullable = false, length = 255)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Permissao permissao;

    @Column(nullable = false)
    private Boolean status = false;

    @Column(name = "precisa_trocar_senha", nullable = false)
    private Boolean precisaTrocarSenha = true;

    @Column(name = "data_ultima_troca_senha")
    private LocalDateTime dataUltimaTrocaSenha;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
