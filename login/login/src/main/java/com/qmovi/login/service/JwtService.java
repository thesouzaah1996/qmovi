package com.qmovi.login.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.qmovi.login.infra.exception.TokenInvalidoException;
import com.qmovi.login.model.Usuario;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String ESPACO_VAZIO = " ";
    private static final Integer INDICE_TOKEN = 1;
    private static final Integer UM_DIA_EM_HORAS = 24;
    
    @Value("${app.token.secret-key}")
    private String secretKey;

    public String criarToken(Usuario usuario) {
        var data = new HashMap<String, String>();
        data.put("id", usuario.getId().toString());
        data.put("usuario", usuario.getUsuario());
        data.put("permissão", usuario.getPermissao().toString());
        return Jwts
            .builder()
            .setClaims(data)
            .setExpiration(gerarDataDeExpiracao())
            .signWith(gerarAssinatura())
            .compact();
    }

    private Date gerarDataDeExpiracao() {
        return Date.from(
            LocalDateTime.now()
            .plusHours(UM_DIA_EM_HORAS)
            .atZone(ZoneId.systemDefault()).toInstant()
        );
    }

    private SecretKey gerarAssinatura() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public void validarTokenDeAcesso(String token) {
        var tokenDeAcesso = extrairToken(token);
        try {
            Jwts
                .parserBuilder()
                .setSigningKey(gerarAssinatura())
                .build()
                .parseClaimsJws(tokenDeAcesso)
                .getBody();
        } catch (Exception ex) {
            throw new TokenInvalidoException("Token Inválido " + ex.getMessage()){};
        }
    }

    private String extrairToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new TokenInvalidoException("O token de acesso não foi informado.");
        }
        if (token.contains(ESPACO_VAZIO)) {
            return token.split(ESPACO_VAZIO)[INDICE_TOKEN];
        }
        return token;
    }
}
