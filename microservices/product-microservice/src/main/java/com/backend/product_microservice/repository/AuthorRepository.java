package com.backend.product_microservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.product_microservice.entity.Author;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

}
