package com.backend.product_microservice.service.impl;
import com.backend.product_microservice.dto.request.AuthorRequest;
import com.backend.product_microservice.dto.response.AuthorResponse;
import com.backend.product_microservice.entity.Author;
import com.backend.product_microservice.exception.AuthorHasProductsException;
import com.backend.product_microservice.exception.ResourceNotFoundException;
import com.backend.product_microservice.mapper.AuthorMapper;
import com.backend.product_microservice.repository.AuthorRepository;
import com.backend.product_microservice.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    @Override @Transactional
    public AuthorResponse createAuthor(AuthorRequest request) {
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            var existing = authorRepository.findByIdempotencyKey(request.idempotencyKey());
            if (existing.isPresent()) {
                return authorMapper.toResponse(existing.get());
            }
        }
        Author author = authorMapper.toEntity(request);
        return authorMapper.toResponse(authorRepository.save(author));
    }

    @Override
    public AuthorResponse getAuthorById(Long id) {
        return authorMapper.toResponse(findAuthorOrThrow(id));
    }

    @Override
    public Page<AuthorResponse> getAllAuthors(Pageable pageable) {
        return authorRepository.findAll(pageable).map(authorMapper::toResponse);
    }

    @Override @Transactional
    public AuthorResponse updateAuthor(Long id, AuthorRequest request) {
        Author author = findAuthorOrThrow(id);
        authorMapper.updateEntity(author, request);
        return authorMapper.toResponse(authorRepository.save(author));
    }

    @Override @Transactional
    public void deleteAuthor(Long id) {
        Author author = findAuthorOrThrow(id);
        boolean hasActiveBooks = author.getLibros() != null &&
                author.getLibros().stream().anyMatch(p -> Boolean.TRUE.equals(p.getIsActive()));
        if (hasActiveBooks) {
            throw new AuthorHasProductsException(id);
        }
        authorRepository.delete(author);
    }

    private Author findAuthorOrThrow(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor no encontrado id: " + id));
    }
}