package ro.mpp2026.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecipeIngredientRequest {
    @NotBlank(message = "Ingredient name is required")
    private String name;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be a positive number")
    private Double quantity;

    @NotBlank(message = "Unit measurement is required")
    private String unit;
}
