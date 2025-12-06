package com.qmovi.login.infra.exception;

import org.springframework.security.core.AuthenticationException;

public class TokenInvalidoException  extends AuthenticationException {
    public TokenInvalidoException(String msg) {
        super(msg);
    }
}
