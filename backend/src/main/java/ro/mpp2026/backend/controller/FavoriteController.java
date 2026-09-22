package ro.mpp2026.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ro.mpp2026.backend.dto.RecipeResponse;
import ro.mpp2026.backend.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{id}")
    public ResponseEntity<Void> addToFavorites(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.addFavorite(id, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromFavorites(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.removeFavorite(id, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Boolean> isFavorite(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        boolean status = favoriteService.isFavorite(id, userDetails.getUsername());
        return ResponseEntity.ok(status);
    }

    @GetMapping()
    public ResponseEntity<List<RecipeResponse>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(favoriteService.getFavorites(userDetails.getUsername()));
    }
}
