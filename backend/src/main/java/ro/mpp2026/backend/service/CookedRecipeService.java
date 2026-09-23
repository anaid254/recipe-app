package ro.mpp2026.backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.mpp2026.backend.domain.CookedRecipe;
import ro.mpp2026.backend.domain.Recipe;
import ro.mpp2026.backend.domain.User;
import ro.mpp2026.backend.domain.enums.RecipeStatus;
import ro.mpp2026.backend.dto.CookedRecipeResponse;
import ro.mpp2026.backend.repository.CookedRecipeRepository;
import ro.mpp2026.backend.repository.RecipeRepository;
import ro.mpp2026.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CookedRecipeService {

    private final CookedRecipeRepository cookedRecipeRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    @Transactional
    public CookedRecipeResponse startCooking(Long recipeId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with id " + recipeId));

        if (cookedRecipeRepository.existsByRecipeIdAndUserIdAndStatus(recipeId, user.getId(), RecipeStatus.COOKING)) {
            throw new IllegalArgumentException("Recipe is already being cooked");
        }

        CookedRecipe cookedRecipe = new CookedRecipe();
        cookedRecipe.setUser(user);
        cookedRecipe.setRecipe(recipe);
        cookedRecipe.setStatus(RecipeStatus.COOKING);

        CookedRecipe saved = cookedRecipeRepository.save(cookedRecipe);
        return mapToResponse(saved);
    }

    @Transactional
    public CookedRecipeResponse updateStatus(Long cookedRecipeId, RecipeStatus status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        CookedRecipe cookedRecipe = cookedRecipeRepository.findByIdAndUserId(cookedRecipeId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cooked recipe not found"));

        cookedRecipe.setStatus(status);
        CookedRecipe saved = cookedRecipeRepository.save(cookedRecipe);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CookedRecipeResponse> getCookedRecipes(RecipeStatus status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        List<CookedRecipe> list = (status != null)
                ? cookedRecipeRepository.findByUserIdAndStatus(user.getId(), status)
                : cookedRecipeRepository.findByUserId(user.getId());

        return list.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteCookedRecipe(Long cookedRecipeId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        CookedRecipe cookedRecipe = cookedRecipeRepository.findByIdAndUserId(cookedRecipeId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cooked recipe not found"));
        cookedRecipeRepository.delete(cookedRecipe);
    }

    private CookedRecipeResponse mapToResponse(CookedRecipe cookedRecipe) {
        return CookedRecipeResponse.builder()
                .id(cookedRecipe.getId())
                .status(cookedRecipe.getStatus())
                .createdAt(cookedRecipe.getStartedAt())
                .recipe(recipeService.mapToResponse(cookedRecipe.getRecipe()))
                .build();
    }
}
