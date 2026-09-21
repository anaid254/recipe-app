package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.mpp2026.backend.domain.Recipe;
import ro.mpp2026.backend.domain.User;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe,Long> {
    List<Recipe> findByTitleContainingIgnoreCase(String title);

    List<Recipe> findByUserId(Long userId);

    @Query("SELECT r FROM Recipe r LEFT JOIN FETCH r.recipeIngredients ri LEFT JOIN FETCH ri.ingredient WHERE r.id = :id")
    Optional<Recipe> findByIdWithIngredients(@Param("id") Long id);

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN FETCH r.recipeIngredients ri LEFT JOIN FETCH ri.ingredient")
    List<Recipe> findAllWithIngredients();
}
