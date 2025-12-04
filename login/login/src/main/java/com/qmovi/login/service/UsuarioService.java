package com.qmovi.login.service;

import com.qmovi.login.model.Usuario;
import com.qmovi.login.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    @Autowired
    private  UsuarioRepository repository;

    @Autowired
    private  PasswordEncoder encoder;

    public void salvar(Usuario usuario) {
        var senha = usuario.getSenha();
        usuario.setSenha(encoder.encode(senha));
        repository.save(usuario);
    }

    public Usuario obterPorUsuario(String usuario) {
        return repository.findByUsuario(usuario);
    }
}
