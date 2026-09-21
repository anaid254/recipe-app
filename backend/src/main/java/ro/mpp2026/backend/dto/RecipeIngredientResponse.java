package ro.mpp2026.backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecipeIngredientResponse {
    private Long id;
    private String name;
    private Double quantity;
    private String unit;
}

