package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.Recipe;

public interface RecipeRepository extends JpaRepository<Recipe,Long> {
}
