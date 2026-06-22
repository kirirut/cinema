package org.example.cinema.service;

import org.example.cinema.dto.AdminUserCreateRequest;
import org.example.cinema.dto.AdminUserUpdateRequest;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.dto.UserProfileUpdateRequest;
import org.example.cinema.dto.UserResponse;
import org.example.cinema.entity.Role;
import org.example.cinema.entity.User;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleService roleService,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getMe() {
        return EntityMapper.toUserResponse(currentUserService.getCurrentUser());
    }

    @Transactional
    public UserResponse updateMe(UserProfileUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email().toLowerCase())) {
                throw new ConflictException("Email already registered");
            }
            user.setEmail(request.email());
        }
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        return EntityMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(String query, Pageable pageable) {
        Page<User> page = query == null || query.isBlank()
                ? userRepository.findAll(pageable)
                : userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        query.trim(), query.trim(), pageable);
        return PageResponse.from(page.map(EntityMapper::toUserResponse));
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userRepository.findById(id)
                .map(EntityMapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public UserResponse create(AdminUserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setActive(request.active() == null || request.active());
        user.setRoles(resolveRoles(request.roles()));
        return EntityMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email().toLowerCase())) {
                throw new ConflictException("Email already registered");
            }
            user.setEmail(request.email());
        }
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }
        if (request.roles() != null) {
            user.setRoles(resolveRoles(request.roles()));
        }
        return EntityMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return Set.of(roleService.getEntityByName("USER"));
        }
        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            roles.add(roleService.getEntityByName(roleName));
        }
        return roles;
    }
}
