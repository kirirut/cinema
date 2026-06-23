package org.example.cinema.service;

import org.example.cinema.dto.ActorRequest;
import org.example.cinema.dto.ActorResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.entity.Actor;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.ActorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActorService {

    private static final String ACTOR_NOT_FOUND = "Actor not found: ";

    private final ActorRepository actorRepository;

    public ActorService(ActorRepository actorRepository) {
        this.actorRepository = actorRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ActorResponse> findAll(String query, Pageable pageable) {
        Page<Actor> page = query == null || query.isBlank()
                ? actorRepository.findAll(pageable)
                : actorRepository.findByFullNameContainingIgnoreCase(query.trim(), pageable);
        return PageResponse.from(page.map(EntityMapper::toActorResponse));
    }

    @Transactional(readOnly = true)
    public ActorResponse findById(Long id) {
        return actorRepository.findById(id)
                .map(EntityMapper::toActorResponse)
                .orElseThrow(() -> new ResourceNotFoundException(ACTOR_NOT_FOUND + id));
    }

    @Transactional
    public ActorResponse create(ActorRequest request) {
        return EntityMapper.toActorResponse(actorRepository.save(mapRequest(new Actor(), request)));
    }

    @Transactional
    public ActorResponse update(Long id, ActorRequest request) {
        Actor actor = actorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ACTOR_NOT_FOUND + id));
        return EntityMapper.toActorResponse(actorRepository.save(mapRequest(actor, request)));
    }

    @Transactional
    public void delete(Long id) {
        if (!actorRepository.existsById(id)) {
            throw new ResourceNotFoundException(ACTOR_NOT_FOUND + id);
        }
        actorRepository.deleteById(id);
    }

    public Actor getEntity(Long id) {
        return actorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ACTOR_NOT_FOUND + id));
    }

    private Actor mapRequest(Actor actor, ActorRequest request) {
        actor.setFullName(request.fullName());
        actor.setBirthDate(request.birthDate());
        actor.setBio(request.bio());
        actor.setPhotoUrl(request.photoUrl());
        return actor;
    }
}
