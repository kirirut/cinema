package org.example.cinema.repository;



import org.example.cinema.entity.Rating;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;



import java.util.List;

import java.util.Optional;



public interface RatingRepository extends JpaRepository<Rating, Long> {



    Optional<Rating> findByUser_IdAndMovie_Id(Long userId, Long movieId);



    List<Rating> findByMovie_Id(Long movieId);



    List<Rating> findByUser_Id(Long userId);



    @Query("""

            SELECT DISTINCT g.id FROM Rating r

            JOIN r.movie m

            JOIN m.genres g

            WHERE r.user.id = :userId AND r.score >= :minScore

            """)

    List<Long> findPreferredGenreIdsByUser(@Param("userId") Long userId, @Param("minScore") short minScore);



    @Query("SELECT r.movie.id FROM Rating r WHERE r.user.id = :userId")

    List<Long> findRatedMovieIdsByUser(@Param("userId") Long userId);

}

