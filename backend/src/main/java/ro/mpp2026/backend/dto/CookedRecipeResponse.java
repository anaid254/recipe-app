package ro.mpp2026.backend.dto;

import lombok.*;
import ro.mpp2026.backend.domain.enums.RecipeStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CookedRecipeResponse {
    private Long id;
    private RecipeStatus status;
    private LocalDateTime createdAt;
    private RecipeResponse recipe;
}
