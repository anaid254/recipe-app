package ro.mpp2026.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import ro.mpp2026.backend.domain.Ingredient;
import ro.mpp2026.backend.domain.enums.RecipeType;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecipeRequest {

    @NotBlank(message = "Recipe title is required")
    private String title;

    @NotBlank(message = "Recipe description is required")
    private String description;

    @NotBlank(message = "Recipe steps are required")
    private String steps;

    @Positive(message = "Prep time must be a positive number")
    private Integer prepTimeMinutes;

    @Positive(message = "Cooking time must be a positive number")
    private Integer cookTimeMinutes;

    @Positive(message = "Servings must be a positive number")
    private Integer servings;

    @NotNull(message = "Recipe type is required")
    private RecipeType recipeType;

    private String imageUrl;

    @Valid
    @NotEmpty(message = "Recipe must have at least one ingredient")
    private List<RecipeIngredientRequest> ingredients;
}
