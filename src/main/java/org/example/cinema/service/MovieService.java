package org.example.cinema.service;

import org.example.cinema.dto.MovieCastRequest;
import org.example.cinema.dto.MovieDetailResponse;
import org.example.cinema.dto.MovieRequest;
import org.example.cinema.dto.MovieSearchCriteria;
import org.example.cinema.dto.MovieSummaryResponse;
import org.example.cinema.dto.PageResponse;
import org.example.cinema.entity.Country;
import org.example.cinema.entity.Director;
import org.example.cinema.entity.Genre;
import org.example.cinema.entity.Movie;
import org.example.cinema.entity.MovieActor;
import org.example.cinema.entity.Tag;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.MovieRepository;
import org.example.cinema.repository.MovieSpecifications;
import org.hibernate.Hibernate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.LongFunction;

@Service
public class MovieService {

    private static final String MOVIE_NOT_FOUND = "Movie not found: ";

    private final MovieRepository movieRepository;
    private final GenreService genreService;
    private final CountryService countryService;
    private final DirectorService directorService;
    private final TagService tagService;
    private final ActorService actorService;

    public MovieService(
            MovieRepository movieRepository,
            GenreService genreService,
            CountryService countryService,
            DirectorService directorService,
            TagService tagService,
            ActorService actorService
    ) {
        this.movieRepository = movieRepository;
        this.genreService = genreService;
        this.countryService = countryService;
        this.directorService = directorService;
        this.tagService = tagService;
        this.actorService = actorService;
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieSummaryResponse> search(MovieSearchCriteria criteria, Pageable pageable) {
        Specification<Movie> spec = Specification.where(MovieSpecifications.titleContains(criteria.q()))
                .and(MovieSpecifications.hasGenreId(criteria.genreId()))
                .and(MovieSpecifications.hasCountryId(criteria.countryId()))
                .and(MovieSpecifications.hasTagId(criteria.tagId()))
                .and(MovieSpecifications.hasDirectorId(criteria.directorId()))
                .and(MovieSpecifications.hasActorId(criteria.actorId()))
                .and(MovieSpecifications.releaseYearFrom(criteria.yearFrom()))
                .and(MovieSpecifications.releaseYearTo(criteria.yearTo()));

        return PageResponse.from(movieRepository.findAll(spec, pageable).map(EntityMapper::toMovieSummaryResponse));
    }

    @Cacheable(value = "movie", key = "#id")
    @Transactional(readOnly = true)
    public MovieDetailResponse findById(Long id) {
        return EntityMapper.toMovieDetailResponse(getMovieWithDetails(id));
    }

    @Transactional
    @CacheEvict(value = {"movies", "movie"}, allEntries = true)
    public MovieDetailResponse create(MovieRequest request) {
        Movie movie = mapRequest(new Movie(), request);
        Movie saved = movieRepository.save(movie);
        return EntityMapper.toMovieDetailResponse(getMovieWithDetails(saved.getId()));
    }

    @Transactional
    @CacheEvict(value = {"movies", "movie"}, allEntries = true)
    public MovieDetailResponse update(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MOVIE_NOT_FOUND + id));
        mapRequest(movie, request);
        movieRepository.save(movie);
        return EntityMapper.toMovieDetailResponse(getMovieWithDetails(id));
    }

    @Transactional
    @CacheEvict(value = {"movies", "movie"}, allEntries = true)
    public void delete(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new ResourceNotFoundException(MOVIE_NOT_FOUND + id);
        }
        movieRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieSummaryResponse> findByGenreId(Long genreId, Pageable pageable) {
        genreService.findById(genreId);
        return PageResponse.from(movieRepository.findByGenreId(genreId, pageable).map(EntityMapper::toMovieSummaryResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieSummaryResponse> findByCountryId(Long countryId, Pageable pageable) {
        countryService.findById(countryId);
        return PageResponse.from(movieRepository.findByCountryId(countryId, pageable).map(EntityMapper::toMovieSummaryResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieSummaryResponse> findByTagId(Long tagId, Pageable pageable) {
        tagService.findById(tagId);
        return PageResponse.from(movieRepository.findByTagId(tagId, pageable).map(EntityMapper::toMovieSummaryResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieSummaryResponse> findByDirectorId(Long directorId, Pageable pageable) {
        directorService.findById(directorId);
        return PageResponse.from(movieRepository.findByDirectorId(directorId, pageable).map(EntityMapper::toMovieSummaryResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<MovieSummaryResponse> findByActorId(Long actorId, Pageable pageable) {
        actorService.findById(actorId);
        return PageResponse.from(movieRepository.findByActorId(actorId, pageable).map(EntityMapper::toMovieSummaryResponse));
    }

    public Movie getEntity(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MOVIE_NOT_FOUND + id));
    }

    private Movie getMovieWithDetails(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MOVIE_NOT_FOUND + id));
        initializeMovieDetails(movie);
        return movie;
    }

    private void initializeMovieDetails(Movie movie) {
        Hibernate.initialize(movie.getGenres());
        Hibernate.initialize(movie.getCountries());
        Hibernate.initialize(movie.getDirectors());
        Hibernate.initialize(movie.getTags());
        Hibernate.initialize(movie.getCast());
        movie.getCast().forEach(castMember -> Hibernate.initialize(castMember.getActor()));
    }

    private Movie mapRequest(Movie movie, MovieRequest request) {
        movie.setTitle(request.title());
        movie.setOriginalTitle(request.originalTitle());
        movie.setDescription(request.description());
        movie.setReleaseYear(request.releaseYear());
        movie.setDurationMinutes(request.durationMinutes());
        movie.setPosterUrl(request.posterUrl());
        movie.setTrailerUrl(request.trailerUrl());
        movie.setAgeRating(request.ageRating());
        movie.setGenres(resolveIds(request.genreIds(), this::loadGenre));
        movie.setCountries(resolveIds(request.countryIds(), this::loadCountry));
        movie.setDirectors(resolveIds(request.directorIds(), this::loadDirector));
        movie.setTags(resolveIds(request.tagIds(), this::loadTag));
        updateCast(movie, request.cast());
        return movie;
    }

    private <T> Set<T> resolveIds(Set<Long> ids, LongFunction<T> loader) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        Set<T> result = new HashSet<>();
        for (Long id : ids) {
            result.add(loader.apply(id));
        }
        return result;
    }

    private Genre loadGenre(long id) {
        return genreService.getEntity(id);
    }

    private Country loadCountry(long id) {
        return countryService.getEntity(id);
    }

    private Director loadDirector(long id) {
        return directorService.getEntity(id);
    }

    private Tag loadTag(long id) {
        return tagService.getEntity(id);
    }

    private void updateCast(Movie movie, List<MovieCastRequest> castRequests) {
        movie.getCast().clear();
        if (castRequests == null || castRequests.isEmpty()) {
            return;
        }
        for (MovieCastRequest castRequest : castRequests) {
            MovieActor movieActor = new MovieActor();
            movieActor.setMovie(movie);
            movieActor.setActor(actorService.getEntity(castRequest.actorId()));
            movieActor.setRoleName(castRequest.roleName());
            movie.getCast().add(movieActor);
        }
    }
}
