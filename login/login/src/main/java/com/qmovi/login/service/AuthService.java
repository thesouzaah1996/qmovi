package com.qmovi.login.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.qmovi.login.dto.AuthRequest;
import com.qmovi.login.dto.TokenDTO;
import com.qmovi.login.repository.UsuarioRepository;

import org.springframework.util.StringUtils;
import jakarta.validation.ValidationException;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AuthService {
    
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public TokenDTO login(AuthRequest request) {
        var usuario = repository
            .findByUsuario(request.usuario())
            .orElseThrow(() -> new ValidationException("Usuário não encontrado."));
        var tokenDeAcesso = jwtService.criarToken(usuario);
        validarSenha(request.senha(), usuario.getSenha());
        return new TokenDTO(tokenDeAcesso);
    }

    private void validarSenha(String senhaPura, String senhaHash) {
        if (!passwordEncoder.matches(senhaPura, senhaHash)) {
            throw new ValidationException("A senha está incorreta.");
        }
    }

    public TokenDTO validarToken(String tokenDeAcesso) {
        validarTokenExistente(tokenDeAcesso);
        jwtService.validarAcessToken(tokenDeAcesso);
        return new TokenDTO(tokenDeAcesso);
    }

    private void validarTokenExistente(String tokenDeAcesso) {
        if (StringUtils.hasText(tokenDeAcesso)) {
            throw new ValidationException("O token de acesso deve ser informado.");
        }
    }
}
