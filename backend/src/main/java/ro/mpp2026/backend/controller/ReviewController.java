package ro.mpp2026.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ro.mpp2026.backend.dto.ReviewRequest;
import ro.mpp2026.backend.dto.ReviewResponse;
import ro.mpp2026.backend.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/recipe/{recipeId}")
    public ResponseEntity<ReviewResponse> createReview(@PathVariable Long recipeId, @Valid @RequestBody ReviewRequest reviewRequest, @AuthenticationPrincipal UserDetails user) {
        ReviewResponse reviewResponse = reviewService.addReview(recipeId, reviewRequest, user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewResponse);
    }

    @PutMapping("/recipe/{recipeId}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long recipeId, @Valid @RequestBody ReviewRequest reviewRequest, @AuthenticationPrincipal UserDetails user) {
        ReviewResponse reviewResponse = reviewService.updateReview(recipeId, reviewRequest, user.getUsername());
        return ResponseEntity.ok(reviewResponse);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @AuthenticationPrincipal UserDetails user) {
        reviewService.deleteReview(reviewId, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRecipe(@PathVariable Long recipeId) {
        return ResponseEntity.ok(reviewService.getReviewsByRecipe(recipeId));
    }

    @GetMapping("/recipe/{recipeId}/me")
    public ResponseEntity<ReviewResponse> getReviewsByUserId(@PathVariable Long recipeId,  @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reviewService.getUserReviewForRecipe(recipeId, user.getUsername()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(user.getUsername()));
    }

    @GetMapping("/recipe/{recipeId}/rating")
    public ResponseEntity<Double> getRatingsByRecipe(@PathVariable Long recipeId) {
        Double averageRating = reviewService.getAverageRatingForRecipe(recipeId);
        return ResponseEntity.ok(averageRating);
    }

    @GetMapping("/author/{authorId}/rating")
    public ResponseEntity<Double> getRatingsByAuthor(@PathVariable Long authorId) {
        Double averageRating = reviewService.getAverageRatingForAuthor(authorId);
        return ResponseEntity.ok(averageRating);
    }
}
