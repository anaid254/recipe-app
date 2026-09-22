package ro.mpp2026.backend.service;

import org.apache.commons.io.FilenameUtils;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ro.mpp2026.backend.domain.Ingredient;
import ro.mpp2026.backend.domain.Recipe;
import ro.mpp2026.backend.domain.RecipeIngredient;
import ro.mpp2026.backend.domain.User;
import ro.mpp2026.backend.domain.enums.Role;
import ro.mpp2026.backend.dto.*;
import ro.mpp2026.backend.repository.IngredientRepository;
import ro.mpp2026.backend.repository.RecipeRepository;
import ro.mpp2026.backend.repository.UserRepository;
import ro.mpp2026.backend.util.FileUploadUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public RecipeResponse createRecipe(RecipeRequest recipeRequest, String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + currentUsername));

        Recipe recipe = Recipe.builder()
                .title(recipeRequest.getTitle())
                .description(recipeRequest.getDescription())
                .prepTimeMinutes(recipeRequest.getPrepTimeMinutes())
                .cookingTimeMinutes(recipeRequest.getCookTimeMinutes())
                .servings(recipeRequest.getServings())
                .imageUrl(recipeRequest.getImageUrl())
                .user(user)
                .build();
        if(recipeRequest.getIngredients() != null) {
            for(RecipeIngredientRequest item : recipeRequest.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(item.getName().trim())
                        .orElseGet(() -> ingredientRepository.save(
                                Ingredient.builder()
                                        .name(item.getName().trim())
                                        .build()
                        ));

                RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                        .ingredient(ingredient)
                        .quantity(item.getQuantity())
                        .unit(item.getUnit())
                        .build();
                recipe.addRecipeIngredient(recipeIngredient);
            }
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        return mapToResponse(savedRecipe);
    }

    @Transactional
    public RecipeResponse uploadImage(final Long recipeId, final MultipartFile file, final String currentUsername) {
        final Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with id " + recipeId));

        final User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + currentUsername));

        if (!recipe.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You are not authorized to update the image for this recipe");
        }

        FileUploadUtil.assertAllowed(file, FileUploadUtil.IMAGE_PATTERN);

        final String rawBaseName = FilenameUtils.getBaseName(file.getOriginalFilename());
        final String baseName = rawBaseName != null ? rawBaseName.replaceAll("\\s+", "_") : "recipe";
        final String fileName = FileUploadUtil.getFileName(baseName);

        final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);
        recipe.setImageUrl(response.getUrl());

        final Recipe savedRecipe = recipeRepository.save(recipe);
        return mapToResponse(savedRecipe);
    }

    @Transactional
    public RecipeResponse updateRecipe(Long recipeId, RecipeRequest recipeRequest, String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + currentUsername));

        Recipe recipe = recipeRepository.findByIdWithIngredients(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with id " + recipeId));

        if (!recipe.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You are not authorized to update this recipe");
        }

        recipe.setTitle(recipeRequest.getTitle());
        recipe.setDescription(recipeRequest.getDescription());
        recipe.setPrepTimeMinutes(recipeRequest.getPrepTimeMinutes());
        recipe.setCookingTimeMinutes(recipeRequest.getCookTimeMinutes());
        recipe.setServings(recipeRequest.getServings());
        recipe.setImageUrl(recipeRequest.getImageUrl());

        if (recipeRequest.getIngredients() != null) {
            new ArrayList<>(recipe.getRecipeIngredients()).forEach(recipe::removeRecipeIngredient);

            recipeRepository.flush();

            for (RecipeIngredientRequest item : recipeRequest.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(item.getName().trim())
                        .orElseGet(() -> ingredientRepository.save(
                                Ingredient.builder()
                                        .name(item.getName().trim())
                                        .build()
                        ));

                RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                        .ingredient(ingredient)
                        .quantity(item.getQuantity())
                        .unit(item.getUnit())
                        .build();
                recipe.addRecipeIngredient(recipeIngredient);
            }
        }
        Recipe savedRecipe = recipeRepository.save(recipe);
        return mapToResponse(savedRecipe);
    }

    @Transactional
    public void deleteRecipe(Long recipeId, String currentUsername) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with id " + recipeId));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + currentUsername));

        boolean isAuthor = recipe.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this recipe");
        }
        recipeRepository.delete(recipe);
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getAllRecipes() {
        return recipeRepository.findAllWithIngredients()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecipeResponse getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findByIdWithIngredients(id)
                .orElseThrow( () -> new IllegalArgumentException("Recipe not found with id " + id));
        return mapToResponse(recipe);
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getRecipesByUser(Long userId) {
        return recipeRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> searchRecipesByTitle(String title) {
        return recipeRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    public RecipeResponse mapToResponse(Recipe recipe) {
        List<RecipeIngredientResponse> ingredientResponses = recipe.getRecipeIngredients() != null
                ? recipe.getRecipeIngredients().stream()
                .map(ri -> RecipeIngredientResponse.builder()
                        .id(ri.getId())
                        .name(ri.getIngredient().getName())
                        .quantity(ri.getQuantity())
                        .unit(ri.getUnit())
                        .build())
                .toList()
                : List.of();

        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .prepTimeMinutes(recipe.getPrepTimeMinutes())
                .cookingTimeMinutes(recipe.getCookingTimeMinutes())
                .servings(recipe.getServings())
                .imageUrl(recipe.getImageUrl())
                .createdAt(recipe.getCreatedAt())
                .authorId(recipe.getUser().getId())
                .authorUsername(recipe.getUser().getUsername())
                .ingredients(ingredientResponses)
                .build();
    }
}
