package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.CookedRecipe;
import ro.mpp2026.backend.domain.enums.RecipeStatus;

import java.util.List;
import java.util.Optional;

public interface CookedRecipeRepository extends JpaRepository<CookedRecipe,Long> {
    List<CookedRecipe> findByUserId(Long id);
    List<CookedRecipe> findByUserIdAndStatus(Long userId, RecipeStatus status);
    Optional<CookedRecipe> findByIdAndUserId(Long id, Long userId);
    boolean existsByRecipeIdAndUserIdAndStatus(Long recipeId, Long userId, RecipeStatus status);
    long countByUserIdAndStatus(Long userId, RecipeStatus status);
}
