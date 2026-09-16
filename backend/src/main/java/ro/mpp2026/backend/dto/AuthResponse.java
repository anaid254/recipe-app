package ro.mpp2026.backend.dto;

import lombok.*;
import ro.mpp2026.backend.domain.enums.Role;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private Role role;
}
