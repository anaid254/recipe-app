package ro.mpp2026.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ro.mpp2026.backend.domain.enums.RecipeStatus;
import ro.mpp2026.backend.dto.CookedRecipeResponse;
import ro.mpp2026.backend.service.CookedRecipeService;

import java.util.List;

@RestController
@RequestMapping("/api/cooked")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CookedRecipeController {

    private final CookedRecipeService cookedRecipeService;

    @PostMapping("/{id}")
    public ResponseEntity<CookedRecipeResponse> startCooking(@PathVariable Long id, @AuthenticationPrincipal UserDetails user){
        CookedRecipeResponse cookedRecipeResponse = cookedRecipeService.startCooking(id, user.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(cookedRecipeResponse);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CookedRecipeResponse> updateStatus(@PathVariable Long id, @RequestParam RecipeStatus status,  @AuthenticationPrincipal UserDetails user){
        CookedRecipeResponse cookedRecipeResponse = cookedRecipeService.updateStatus(id, status, user.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(cookedRecipeResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCookedRecipe(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        cookedRecipeService.deleteCookedRecipe(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CookedRecipeResponse>> getCookedRecipes(
            @RequestParam(required = false) RecipeStatus status,
            @AuthenticationPrincipal UserDetails userDetails){
        return ResponseEntity.ok(cookedRecipeService.getCookedRecipes(status, userDetails.getUsername()));
    }
}
