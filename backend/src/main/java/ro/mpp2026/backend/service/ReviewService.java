package ro.mpp2026.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.mpp2026.backend.domain.Recipe;
import ro.mpp2026.backend.domain.Review;
import ro.mpp2026.backend.domain.User;
import ro.mpp2026.backend.dto.ReviewRequest;
import ro.mpp2026.backend.dto.ReviewResponse;
import ro.mpp2026.backend.repository.RecipeRepository;
import ro.mpp2026.backend.repository.ReviewRepository;
import ro.mpp2026.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final ReviewRepository reviewRepository;


    @Transactional
    public ReviewResponse addReview(Long recipeId, ReviewRequest reviewRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with id " + recipeId));

        if(reviewRepository.existsByRecipeIdAndUserId(recipeId, user.getId())){
            throw new IllegalArgumentException("Review already exists");
        }

        if(recipe.getUser().getId().equals(user.getId())){
            throw new IllegalArgumentException("You cannot review your own recipe");
        }

        Review review = new Review();
        review.setComment(reviewRequest.getComment());
        review.setUser(user);
        review.setRecipe(recipe);
        review.setRating(reviewRequest.getRating());
        Review saved = reviewRepository.save(review);

        return mapToResponse(saved);
    }

    @Transactional
    public ReviewResponse updateReview(Long recipeId, ReviewRequest reviewRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        Review review = reviewRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setComment(reviewRequest.getComment());
        review.setRating(reviewRequest.getRating());
        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteReview(Long recipeId, String username) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new IllegalArgumentException("Recipe not found with id " + recipeId);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        Review review = reviewRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        reviewRepository.delete(review);
    }

    @Transactional
    public void deleteReviewByAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByRecipe(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new IllegalArgumentException("Recipe not found with id " + recipeId);
        }

        return reviewRepository.findByRecipeId(recipeId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        return reviewRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Double getAverageRatingForRecipe(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new IllegalArgumentException("Recipe not found with id " + recipeId);
        }

        Double avg = reviewRepository.getAverageRatingByRecipeId(recipeId);
        if (avg == null) {
            return 0.0;
        }

        return Math.round(avg * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public Double getAverageRatingForAuthor(Long authorId) {
        if (!userRepository.existsById(authorId)) {
            throw new IllegalArgumentException("User not found with id " + authorId);
        }

        Double avg = reviewRepository.getAverageRatingForAuthorId(authorId);
        if (avg == null) {
            return 0.0;
        }

        return Math.round(avg * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public ReviewResponse getUserReviewForRecipe(Long recipeId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        return reviewRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .map(this::mapToResponse)
                .orElse(null);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .comment(review.getComment())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .recipeId(review.getRecipe().getId())
                .build();
    }
}
