package ro.mpp2026.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ro.mpp2026.backend.domain.enums.Role;
import ro.mpp2026.backend.dto.AdminAuditLogResponse;
import ro.mpp2026.backend.dto.UserProfileResponse;
import ro.mpp2026.backend.service.AuditService;
import ro.mpp2026.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditService auditService;


    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserProfileResponse> changeUserRole(
            @PathVariable Long id,
            @RequestParam Role role,
            @AuthenticationPrincipal UserDetails admin
    ) {
        return ResponseEntity.ok(userService.changeUserRole(id, role, admin.getUsername()));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> setUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            @AuthenticationPrincipal UserDetails admin
    ) {
        userService.setUserStatusByAdmin(id, enabled, admin.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String adminUsername,
            @RequestParam(required = false) String targetEntity,
            @RequestParam(required = false) Long targetEntityId
    ) {
        if (adminUsername != null && !adminUsername.isBlank()) {
            return ResponseEntity.ok(auditService.getLogsByAdmin(adminUsername.trim()));
        }

        if (targetEntity != null && !targetEntity.isBlank() && targetEntityId != null) {
            return ResponseEntity.ok(auditService.getLogsByEntity(targetEntity.trim().toUpperCase(), targetEntityId));
        }

        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }
}
