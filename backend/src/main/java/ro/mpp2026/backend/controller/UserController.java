package ro.mpp2026.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.mpp2026.backend.dto.*;
import ro.mpp2026.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(userService.getMyProfile(user.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest updateProfileRequest, @AuthenticationPrincipal UserDetails user){
        return ResponseEntity.ok(userService.updateUserProfile(updateProfileRequest,user.getUsername()));
    }

    @PostMapping(value = "/me/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponse> uploadImage(
            @RequestPart("file") final MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(userService.uploadProfilePicture(file, userDetails.getUsername()));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest, @AuthenticationPrincipal UserDetails userDetails){
        userService.changePassword(changePasswordRequest,userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserDetails userDetails){
        userService.deleteAccount(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(@AuthenticationPrincipal UserDetails userDetails){
        return ResponseEntity.ok(userService.getUserStats(userDetails.getUsername()));
    }
}
