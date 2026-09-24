package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.Favorite;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite,Long> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndRecipeId(Long userId, Long recipeId);
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
    long countByUserId(Long userId);
}
