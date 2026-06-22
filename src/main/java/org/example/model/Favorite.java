package org.example.model;

import java.time.LocalDateTime;

public class Favorite {

    private Long userId;
    private Long movieId;
    private LocalDateTime addedAt;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    @Override
    public String toString() {
        return "Favorite{userId=%d, movieId=%d, addedAt=%s}".formatted(userId, movieId, addedAt);
    }
}
