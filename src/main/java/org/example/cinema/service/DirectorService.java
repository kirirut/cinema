package org.example.cinema.service;

import org.example.cinema.dto.DirectorRequest;
import org.example.cinema.dto.DirectorResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.entity.Director;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.DirectorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DirectorService {

    private final DirectorRepository directorRepository;

    public DirectorService(DirectorRepository directorRepository) {
        this.directorRepository = directorRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<DirectorResponse> findAll(String query, Pageable pageable) {
        Page<Director> page = query == null || query.isBlank()
                ? directorRepository.findAll(pageable)
                : directorRepository.findByFullNameContainingIgnoreCase(query.trim(), pageable);
        return PageResponse.from(page.map(EntityMapper::toDirectorResponse));
    }

    @Transactional(readOnly = true)
    public DirectorResponse findById(Long id) {
        return directorRepository.findById(id)
                .map(EntityMapper::toDirectorResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Director not found: " + id));
    }

    @Transactional
    public DirectorResponse create(DirectorRequest request) {
        return EntityMapper.toDirectorResponse(directorRepository.save(mapRequest(new Director(), request)));
    }

    @Transactional
    public DirectorResponse update(Long id, DirectorRequest request) {
        Director director = directorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Director not found: " + id));
        return EntityMapper.toDirectorResponse(directorRepository.save(mapRequest(director, request)));
    }

    @Transactional
    public void delete(Long id) {
        if (!directorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Director not found: " + id);
        }
        directorRepository.deleteById(id);
    }

    public Director getEntity(Long id) {
        return directorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Director not found: " + id));
    }

    private Director mapRequest(Director director, DirectorRequest request) {
        director.setFullName(request.fullName());
        director.setBirthDate(request.birthDate());
        director.setBio(request.bio());
        director.setPhotoUrl(request.photoUrl());
        return director;
    }
}
