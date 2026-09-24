package ro.mpp2026.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserStatsResponse {
    private long recipesCreatedCount;
    private long recipesCookedCount;
    private long favoritesCount;
    private long reviewsGivenCount;
    private Double averageAuthorRating;
}
