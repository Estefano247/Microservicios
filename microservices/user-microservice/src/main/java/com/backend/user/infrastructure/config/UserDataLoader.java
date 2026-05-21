package com.backend.user.infrastructure.config;

import com.backend.user.domain.entity.Role;
import com.backend.user.domain.entity.User;
import com.backend.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "test"})
public class UserDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Solo carga si la tabla está vacía (o cambia la condición)
        if (userRepository.count() == 0) {
            log.info("Cargando usuarios de prueba...");
            createTestUsers();
            log.info("Usuarios de prueba cargados exitosamente.");
        } else {
            log.info("La tabla de usuarios ya contiene datos. No se cargarán usuarios de prueba.");
        }
    }

    private void createTestUsers() {
        List<User> users = List.of(
            // Administradores
            User.builder()
                .name("Jorge")
                .lastName("Sanchez")
                .email("jorge.s@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("950555666")
                .role(Role.ADMIN)
                .enabled(true)
                .birthday(LocalDate.of(1980, 7, 19))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Andres")
                .lastName("Castro")
                .email("a.castro@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("933444555")
                .role(Role.ADMIN)
                .enabled(true)
                .birthday(LocalDate.of(1979, 12, 12))
                .emailVerified(true)
                .build(),

            // Vendedores
            User.builder()
                .name("Luis")
                .lastName("Perez")
                .email("luis.perez@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("930333444")
                .role(Role.SELLER)
                .enabled(true)
                .birthday(LocalDate.of(1992, 11, 10))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Roberto")
                .lastName("Gomez")
                .email("roberto.g@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("970777888")
                .role(Role.SELLER)
                .enabled(true)
                .birthday(LocalDate.of(1987, 9, 14))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Sofia")
                .lastName("Diaz")
                .email("sofia.diaz@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("900111222")
                .role(Role.SELLER)
                .enabled(true)
                .birthday(LocalDate.of(1989, 2, 17))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Diego")
                .lastName("Morales")
                .email("diego.m@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("955666777")
                .role(Role.SELLER)
                .enabled(true)
                .birthday(LocalDate.of(1982, 3, 11))
                .emailVerified(true)
                .build(),

            // Clientes (muchos)
            User.builder()
                .name("Carlos")
                .lastName("Mendoza")
                .email("carlos.m@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("910111222")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1990, 5, 15))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Ana")
                .lastName("Garcia")
                .email("ana.garcia@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("920222333")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1985, 8, 22))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Maria")
                .lastName("Rodriguez")
                .email("m.rodriguez@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("940444555")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1988, 3, 3))
                .emailVerified(false)
                .build(),
            User.builder()
                .name("Lucia")
                .lastName("Fernandez")
                .email("lucia.f@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("960666777")
                .role(Role.CUSTOMER)
                .enabled(false)   // usuario deshabilitado
                .birthday(LocalDate.of(1995, 12, 25))
                .emailVerified(false)
                .build(),
            User.builder()
                .name("Elena")
                .lastName("Martinez")
                .email("elena.m@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("980888999")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1993, 4, 8))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Ricardo")
                .lastName("Lopez")
                .email("ricardo.l@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("990999000")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1991, 6, 30))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Fernando")
                .lastName("Torres")
                .email("f.torres@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("911222333")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1994, 10, 5))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Gabriela")
                .lastName("Ruiz")
                .email("gaby.ruiz@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("922333444")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1996, 1, 20))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Monica")
                .lastName("Suarez")
                .email("monica.s@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("944555666")
                .role(Role.CUSTOMER)
                .enabled(false)
                .birthday(LocalDate.of(1998, 7, 24))
                .emailVerified(false)
                .build(),
            User.builder()
                .name("Pedro")
                .lastName("Ramirez")
                .email("pedro.ramirez@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("977888999")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1983, 8, 20))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Laura")
                .lastName("Flores")
                .email("laura.flores@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("966777888")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1997, 3, 12))
                .emailVerified(false)
                .build(),
            User.builder()
                .name("Martin")
                .lastName("Ortiz")
                .email("martin.ortiz@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("955444333")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1992, 11, 5))
                .emailVerified(true)
                .build(),
            User.builder()
                .name("Veronica")
                .lastName("Sanchez")
                .email("veronica.sanchez@example.com")
                .password(passwordEncoder.encode("Test@123456"))
                .phone("944333222")
                .role(Role.CUSTOMER)
                .enabled(true)
                .birthday(LocalDate.of(1986, 6, 20))
                .emailVerified(true)
                .build()
        );

        userRepository.saveAll(users);
    }
}