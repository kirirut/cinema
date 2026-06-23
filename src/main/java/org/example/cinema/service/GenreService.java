package org.example.cinema.service;

import org.example.cinema.dto.GenreRequest;
import org.example.cinema.dto.GenreResponse;
import org.example.cinema.entity.Genre;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.GenreRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GenreService {

    private static final String GENRE_NOT_FOUND = "Genre not found: ";

    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @Cacheable("genres")
    @Transactional(readOnly = true)
    public List<GenreResponse> findAll() {
        return genreRepository.findAll().stream().map(EntityMapper::toGenreResponse).toList();
    }

    @Cacheable(value = "genre", key = "#id")
    @Transactional(readOnly = true)
    public GenreResponse findById(Long id) {
        return genreRepository.findById(id)
                .map(EntityMapper::toGenreResponse)
                .orElseThrow(() -> new ResourceNotFoundException(GENRE_NOT_FOUND + id));
    }

    @Transactional
    @CacheEvict(value = {"genres", "genre"}, allEntries = true)
    public GenreResponse create(GenreRequest request) {
        if (genreRepository.existsBySlug(request.slug())) {
            throw new ConflictException("Genre slug already exists");
        }
        Genre genre = new Genre();
        genre.setName(request.name());
        genre.setSlug(request.slug());
        return EntityMapper.toGenreResponse(genreRepository.save(genre));
    }

    @Transactional
    @CacheEvict(value = {"genres", "genre"}, allEntries = true)
    public GenreResponse update(Long id, GenreRequest request) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GENRE_NOT_FOUND + id));
        genre.setName(request.name());
        genre.setSlug(request.slug());
        return EntityMapper.toGenreResponse(genreRepository.save(genre));
    }

    @Transactional
    @CacheEvict(value = {"genres", "genre"}, allEntries = true)
    public void delete(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new ResourceNotFoundException(GENRE_NOT_FOUND + id);
        }
        genreRepository.deleteById(id);
    }

    public Genre getEntity(long id) {
        return getEntity(Long.valueOf(id));
    }

    public Genre getEntity(Long id) {
        return genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GENRE_NOT_FOUND + id));
    }
}
