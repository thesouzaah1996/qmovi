package com.qmovi.login.repository;

import com.qmovi.login.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByUsuario(String usuario);
}
