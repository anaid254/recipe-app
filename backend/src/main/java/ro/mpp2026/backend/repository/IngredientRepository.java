package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.Ingredient;

import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient,Long> {
    Optional<Ingredient> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
