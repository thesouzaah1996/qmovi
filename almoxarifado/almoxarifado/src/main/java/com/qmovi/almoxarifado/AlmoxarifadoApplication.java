package com.qmovi.almoxarifado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// @SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
@SpringBootApplication
public class AlmoxarifadoApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlmoxarifadoApplication.class, args);
	}

}
