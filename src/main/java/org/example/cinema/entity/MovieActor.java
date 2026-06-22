package org.example.cinema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "movie_actors")
public class MovieActor {

    @EmbeddedId
    private MovieActorId id = new MovieActorId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("movieId")
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("actorId")
    @JoinColumn(name = "actor_id", nullable = false)
    private Actor actor;

    @Column(name = "role_name", length = 200)
    private String roleName;

    public MovieActorId getId() {
        return id;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Actor getActor() {
        return actor;
    }

    public void setActor(Actor actor) {
        this.actor = actor;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    @Embeddable
    public static class MovieActorId implements Serializable {

        @Column(name = "movie_id")
        private Long movieId;

        @Column(name = "actor_id")
        private Long actorId;

        public MovieActorId() {
        }

        public MovieActorId(Long movieId, Long actorId) {
            this.movieId = movieId;
            this.actorId = actorId;
        }

        public Long getMovieId() {
            return movieId;
        }

        public void setMovieId(Long movieId) {
            this.movieId = movieId;
        }

        public Long getActorId() {
            return actorId;
        }

        public void setActorId(Long actorId) {
            this.actorId = actorId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (!(o instanceof MovieActorId that)) {
                return false;
            }
            return Objects.equals(movieId, that.movieId) && Objects.equals(actorId, that.actorId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(movieId, actorId);
        }
    }
}
