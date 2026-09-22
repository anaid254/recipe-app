package ro.mpp2026.backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.mpp2026.backend.domain.Favorite;
import ro.mpp2026.backend.domain.Recipe;
import ro.mpp2026.backend.domain.User;
import ro.mpp2026.backend.dto.RecipeResponse;
import ro.mpp2026.backend.repository.FavoriteRepository;
import ro.mpp2026.backend.repository.RecipeRepository;
import ro.mpp2026.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    @Transactional
    public void addFavorite(Long recipeId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with id " + recipeId));
        if (favoriteRepository.existsByUserIdAndRecipeId(user.getId(), recipeId)) {
            throw new IllegalArgumentException("Favorite already exists");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setRecipe(recipe);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long recipeId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        Favorite favorite = favoriteRepository.findByUserIdAndRecipeId(user.getId(), recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Favorite does not exist"));

        favoriteRepository.delete(favorite);
    }

    @Transactional
    public List<RecipeResponse> getFavorites(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(favorite -> recipeService.mapToResponse(favorite.getRecipe()))
                .toList();
    }

    @Transactional
    public boolean isFavorite(Long recipeId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        return favoriteRepository.existsByUserIdAndRecipeId(user.getId(), recipeId);
    }
}
