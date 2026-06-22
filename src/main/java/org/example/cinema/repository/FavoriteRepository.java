package org.example.cinema.repository;



import org.example.cinema.entity.Favorite;

import org.example.cinema.entity.Favorite.FavoriteId;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;



import java.util.List;



public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {



    List<Favorite> findByUser_Id(Long userId);



    @Query("""

            SELECT f FROM Favorite f

            JOIN FETCH f.movie m

            LEFT JOIN FETCH m.genres

            WHERE f.user.id = :userId

            ORDER BY f.addedAt DESC

            """)

    List<Favorite> findByUser_IdOrderByAddedAtDesc(@Param("userId") Long userId);



    boolean existsByUser_IdAndMovie_Id(Long userId, Long movieId);

}

