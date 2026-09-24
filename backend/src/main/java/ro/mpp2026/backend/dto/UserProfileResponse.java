package ro.mpp2026.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import ro.mpp2026.backend.domain.enums.Role;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String bio;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
}
