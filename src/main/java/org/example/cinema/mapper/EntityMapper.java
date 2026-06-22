package org.example.cinema.mapper;

import org.example.cinema.dto.ActorResponse;
import org.example.cinema.dto.CountryResponse;
import org.example.cinema.dto.DirectorResponse;
import org.example.cinema.dto.GenreResponse;
import org.example.cinema.dto.MovieCastResponse;
import org.example.cinema.dto.MovieDetailResponse;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.RatingResponse;
import org.example.cinema.dto.ReviewResponse;
import org.example.cinema.dto.RoleResponse;
import org.example.cinema.dto.TagResponse;
import org.example.cinema.dto.UserResponse;
import org.example.cinema.entity.Actor;
import org.example.cinema.entity.Country;
import org.example.cinema.entity.Director;
import org.example.cinema.entity.Genre;
import org.example.cinema.entity.Movie;
import org.example.cinema.entity.MovieActor;
import org.example.cinema.entity.Rating;
import org.example.cinema.entity.Review;
import org.example.cinema.entity.Role;
import org.example.cinema.entity.Tag;
import org.example.cinema.entity.User;

import java.util.Comparator;
import java.util.stream.Collectors;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                user.isActive()
        );
    }

    public static RoleResponse toRoleResponse(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }

    public static GenreResponse toGenreResponse(Genre genre) {
        return new GenreResponse(genre.getId(), genre.getName(), genre.getSlug());
    }

    public static CountryResponse toCountryResponse(Country country) {
        return new CountryResponse(country.getId(), country.getName(), country.getIsoCode());
    }

    public static ActorResponse toActorResponse(Actor actor) {
        return new ActorResponse(
                actor.getId(),
                actor.getFullName(),
                actor.getBirthDate(),
                actor.getBio(),
                actor.getPhotoUrl(),
                actor.getCreatedAt()
        );
    }

    public static DirectorResponse toDirectorResponse(Director director) {
        return new DirectorResponse(
                director.getId(),
                director.getFullName(),
                director.getBirthDate(),
                director.getBio(),
                director.getPhotoUrl(),
                director.getCreatedAt()
        );
    }

    public static TagResponse toTagResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName());
    }

    public static MovieSummaryResponse toMovieSummaryResponse(Movie movie) {
        return new MovieSummaryResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getReleaseYear(),
                movie.getPosterUrl(),
                movie.getAgeRating(),
                movie.getAverageRating(),
                movie.getRatingsCount(),
                movie.getGenres().stream()
                        .sorted(Comparator.comparing(Genre::getName))
                        .map(EntityMapper::toGenreResponse)
                        .toList()
        );
    }

    public static MovieDetailResponse toMovieDetailResponse(Movie movie) {
        return new MovieDetailResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getDescription(),
                movie.getReleaseYear(),
                movie.getDurationMinutes(),
                movie.getPosterUrl(),
                movie.getTrailerUrl(),
                movie.getAgeRating(),
                movie.getAverageRating(),
                movie.getRatingsCount(),
                movie.getGenres().stream().sorted(Comparator.comparing(Genre::getName)).map(EntityMapper::toGenreResponse).toList(),
                movie.getCountries().stream().sorted(Comparator.comparing(Country::getName)).map(EntityMapper::toCountryResponse).toList(),
                movie.getDirectors().stream().sorted(Comparator.comparing(Director::getFullName)).map(EntityMapper::toDirectorResponse).toList(),
                movie.getTags().stream().sorted(Comparator.comparing(Tag::getName)).map(EntityMapper::toTagResponse).toList(),
                movie.getCast().stream()
                        .sorted(Comparator.comparing(ma -> ma.getActor().getFullName()))
                        .map(EntityMapper::toMovieCastResponse)
                        .toList(),
                movie.getCreatedAt(),
                movie.getUpdatedAt()
        );
    }

    public static MovieCastResponse toMovieCastResponse(MovieActor movieActor) {
        return new MovieCastResponse(
                movieActor.getActor().getId(),
                movieActor.getActor().getFullName(),
                movieActor.getRoleName()
        );
    }

    public static RatingResponse toRatingResponse(Rating rating) {
        return new RatingResponse(
                rating.getId(),
                rating.getUser().getId(),
                rating.getUser().getUsername(),
                rating.getMovie().getId(),
                rating.getScore(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }

    public static ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getUsername(),
                review.getMovie().getId(),
                review.getTitle(),
                review.getBody(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
