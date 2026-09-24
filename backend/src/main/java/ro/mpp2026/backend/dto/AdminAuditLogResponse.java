package ro.mpp2026.backend.dto;

import lombok.Builder;
import lombok.Getter;
import ro.mpp2026.backend.domain.enums.AuditAction;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminAuditLogResponse {
    private Long id;
    private String adminUsername;
    private AuditAction action;
    private String targetEntity;
    private Long targetEntityId;
    private String details;
    private LocalDateTime timestamp;
}
