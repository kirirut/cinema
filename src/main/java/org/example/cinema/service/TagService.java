package org.example.cinema.service;

import org.example.cinema.dto.TagRequest;
import org.example.cinema.dto.TagResponse;
import org.example.cinema.entity.Tag;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.TagRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Cacheable("tags")
    @Transactional(readOnly = true)
    public List<TagResponse> findAll() {
        return tagRepository.findAll().stream().map(EntityMapper::toTagResponse).toList();
    }

    @Cacheable(value = "tag", key = "#id")
    @Transactional(readOnly = true)
    public TagResponse findById(Long id) {
        return tagRepository.findById(id)
                .map(EntityMapper::toTagResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
    }

    @Transactional
    @CacheEvict(value = {"tags", "tag"}, allEntries = true)
    public TagResponse create(TagRequest request) {
        if (tagRepository.existsByName(request.name())) {
            throw new ConflictException("Tag already exists");
        }
        Tag tag = new Tag();
        tag.setName(request.name());
        return EntityMapper.toTagResponse(tagRepository.save(tag));
    }

    @Transactional
    @CacheEvict(value = {"tags", "tag"}, allEntries = true)
    public TagResponse update(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
        tag.setName(request.name());
        return EntityMapper.toTagResponse(tagRepository.save(tag));
    }

    @Transactional
    @CacheEvict(value = {"tags", "tag"}, allEntries = true)
    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found: " + id);
        }
        tagRepository.deleteById(id);
    }

    public Tag getEntity(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
    }
}
