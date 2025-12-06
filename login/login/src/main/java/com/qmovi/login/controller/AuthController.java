package com.qmovi.login.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qmovi.login.dto.AuthRequest;
import com.qmovi.login.dto.TokenDTO;
import com.qmovi.login.service.AuthService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("api/auth")
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("login")
    public TokenDTO login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("token/validate")
    public TokenDTO login(@RequestHeader String tokenDeAcesso) {
        return authService.validarToken(tokenDeAcesso);
    }
}
