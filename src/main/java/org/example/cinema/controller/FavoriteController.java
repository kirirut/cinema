package org.example.cinema.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.cinema.dto.FavoriteResponse;
import org.example.cinema.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    @Operation(summary = "List current user's favorites")
    public List<FavoriteResponse> findMine() {
        return favoriteService.findMine();
    }

    @PostMapping("/{movieId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add movie to favorites")
    public FavoriteResponse add(@PathVariable Long movieId) {
        return favoriteService.add(movieId);
    }

    @DeleteMapping("/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove movie from favorites")
    public void remove(@PathVariable Long movieId) {
        favoriteService.remove(movieId);
    }
}
