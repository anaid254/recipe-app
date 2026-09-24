package ro.mpp2026.backend.dto;

import lombok.*;
import ro.mpp2026.backend.domain.enums.RecipeType;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecipeResponse {
    private Long id;
    private String title;
    private String description;
    private String steps;
    private Integer prepTimeMinutes;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;
    private RecipeType recipeType;
    private LocalDateTime createdAt;
    private Long authorId;
    private String authorUsername;

    private List<RecipeIngredientResponse> ingredients;
}
