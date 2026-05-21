package com.backend.product_microservice.service;
import com.backend.product_microservice.dto.request.AuthorRequest;
import com.backend.product_microservice.dto.response.AuthorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuthorService {
    AuthorResponse createAuthor(AuthorRequest request);
    AuthorResponse getAuthorById(Long id);
    Page<AuthorResponse> getAllAuthors(Pageable pageable);
    AuthorResponse updateAuthor(Long id, AuthorRequest request);
    void deleteAuthor(Long id);
}