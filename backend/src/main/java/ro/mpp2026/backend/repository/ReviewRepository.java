package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.mpp2026.backend.domain.Review;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review,Long> {
    Optional<Review> findByRecipeIdAndUserId(Long recipeId, Long userId);
    boolean existsByRecipeIdAndUserId(Long recipeId, Long userId);

    List<Review> findByRecipeId(Long recipeId);
    List<Review> findByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.recipe.id = :recipeId")
    Double getAverageRatingByRecipeId(@Param("recipeId") Long recipeId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.recipe.user.id = :authorId")
    Double getAverageRatingForAuthorId(@Param("authorId") Long authorId);

    long countByUserId(Long userId);
}
