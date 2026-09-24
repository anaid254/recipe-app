package ro.mpp2026.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.mpp2026.backend.domain.enums.RecipeType;
import ro.mpp2026.backend.dto.CloudinaryResponse;
import ro.mpp2026.backend.dto.RecipeRequest;
import ro.mpp2026.backend.dto.RecipeResponse;
import ro.mpp2026.backend.service.RecipeService;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeResponse>> getAllRecipes() {
        return ResponseEntity.ok(recipeService.getAllRecipes());
    }

    @GetMapping("/type")
    public ResponseEntity<List<RecipeResponse>> getRecipeByType(@RequestParam RecipeType recipeType) {
        return ResponseEntity.ok(recipeService.searchRecipesByType(recipeType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<RecipeResponse>> getRecipeByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(recipeService.getRecipesByUser(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecipeResponse>> searchRecipes(@RequestParam String title) {
        return ResponseEntity.ok(recipeService.searchRecipesByTitle(title));
    }

    @PostMapping
    public ResponseEntity<RecipeResponse> addRecipe(@Valid @RequestBody RecipeRequest recipeRequest, @AuthenticationPrincipal UserDetails userDetails) {
        RecipeResponse createRecipe = recipeService.createRecipe(recipeRequest, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(createRecipe);
    }

    @PostMapping(value = "/image/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RecipeResponse> uploadImage(
            @PathVariable Long id,
            @RequestPart final MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RecipeResponse updatedRecipe = recipeService.uploadImage(id, file, userDetails.getUsername());
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id,  @AuthenticationPrincipal UserDetails userDetails) {
        recipeService.deleteRecipe(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponse> updateRecipe (@PathVariable Long id, @Valid @RequestBody RecipeRequest recipeRequest, @AuthenticationPrincipal UserDetails userDetails) {
        RecipeResponse updateRecipe = recipeService.updateRecipe(id, recipeRequest, userDetails.getUsername());
        return ResponseEntity.ok(updateRecipe);
    }
}
