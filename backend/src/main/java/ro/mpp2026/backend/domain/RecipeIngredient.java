package ro.mpp2026.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_ingredients", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"recipe_id", "ingredient_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredient implements IEntity<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id",  nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id",  nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private String unit;
}
