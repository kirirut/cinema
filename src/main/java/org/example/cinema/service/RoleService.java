package org.example.cinema.service;

import org.example.cinema.dto.RoleRequest;
import org.example.cinema.dto.RoleResponse;
import org.example.cinema.entity.Role;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleService {

    private static final String ROLE_NOT_FOUND = "Role not found: ";

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream().map(EntityMapper::toRoleResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse findById(Long id) {
        return roleRepository.findById(id)
                .map(EntityMapper::toRoleResponse)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.existsByName(request.name())) {
            throw new ConflictException("Role already exists");
        }
        Role role = new Role();
        role.setName(request.name());
        return EntityMapper.toRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));
        role.setName(request.name());
        return EntityMapper.toRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public void delete(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException(ROLE_NOT_FOUND + id);
        }
        roleRepository.deleteById(id);
    }

    public Role getEntityByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + name));
    }
}
