package ro.mpp2026.backend.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.mpp2026.backend.domain.Recipe;
import ro.mpp2026.backend.domain.Review;
import ro.mpp2026.backend.domain.User;
import ro.mpp2026.backend.domain.enums.AuditAction;
import ro.mpp2026.backend.domain.enums.RecipeStatus;
import ro.mpp2026.backend.domain.enums.Role;
import ro.mpp2026.backend.dto.*;
import ro.mpp2026.backend.repository.*;
import ro.mpp2026.backend.util.FileUploadUtil;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final CookedRecipeRepository cookedRecipeRepository;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is deactivated");
        }

        return mapToResponse(user);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(UpdateProfileRequest updateProfileRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is deactivated");
        }

        if (!user.getEmail().equalsIgnoreCase(updateProfileRequest.getEmail()) &&
                userRepository.existsByEmail(updateProfileRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + updateProfileRequest.getEmail());
        }

        user.setBio(updateProfileRequest.getBio());
        user.setEmail(updateProfileRequest.getEmail());
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserProfileResponse uploadProfilePicture(final MultipartFile file, final String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + currentUsername));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is deactivated");
        }

        FileUploadUtil.assertAllowed(file, FileUploadUtil.IMAGE_PATTERN);

        final String rawBaseName = FilenameUtils.getBaseName(file.getOriginalFilename());
        final String baseName = rawBaseName != null ? rawBaseName.replaceAll("\\s+", "_") : "recipe";
        final String fileName = FileUploadUtil.getFileName(baseName);

        final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);
        user.setProfilePictureUrl(response.getUrl());

        final User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest changePasswordRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is deactivated");
        }

        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (passwordEncoder.matches(changePasswordRequest.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be identical to the current password");
        }
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username " + username));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is deactivated");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is deactivated");
        }

        Long userId = user.getId();

        long recipesCreated = recipeRepository.countByUserId(userId);
        long reviewsGiven = reviewRepository.countByUserId(userId);
        long recipesCooked = cookedRecipeRepository.countByUserIdAndStatus(userId, RecipeStatus.DONE);
        long favorites = favoriteRepository.countByUserId(userId);

        Double avgRating = reviewRepository.getAverageRatingForAuthorId(userId);
        double roundedAvg = (avgRating != null) ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
        return UserStatsResponse.builder()
                .recipesCreatedCount(recipesCreated)
                .reviewsGivenCount(reviewsGiven)
                .recipesCookedCount(recipesCooked)
                .favoritesCount(favorites)
                .averageAuthorRating(roundedAvg)
                .build();
    }

    @Transactional
    public UserProfileResponse changeUserRole(Long targetUserId, Role role, String username) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found with id: " + targetUserId));

        if (targetUser.getUsername().equalsIgnoreCase(username)) {
            throw new IllegalArgumentException("Admins cannot change their own role");
        }

        Role oldRole = targetUser.getRole();
        targetUser.setRole(role);
        User saved = userRepository.save(targetUser);

        auditService.logAction(
                username,
                AuditAction.CHANGE_USER_ROLE,
                "USER",
                targetUserId,
                String.format("Changed role for user '%s' from %s to %s", targetUser.getUsername(), oldRole, role)
        );

        return mapToResponse(saved);
    }

    @Transactional
    public void setUserStatusByAdmin(Long targetUserId, boolean enabled, String username) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found with id: " + targetUserId));

        if (targetUser.getUsername().equalsIgnoreCase(username)) {
            throw new IllegalArgumentException("Admins cannot deactivate their own account");
        }

        targetUser.setEnabled(enabled);
        userRepository.save(targetUser);

        AuditAction action = enabled ? AuditAction.ACTIVATE_USER : AuditAction.DEACTIVATE_USER;
        auditService.logAction(
                username,
                action,
                "USER",
                targetUserId,
                String.format("Admin set user '%s' enabled status to %b", targetUser.getUsername(), enabled)
        );
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
