package ro.mpp2026.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import ro.mpp2026.backend.domain.AdminAuditLog;
import ro.mpp2026.backend.domain.enums.AuditAction;
import ro.mpp2026.backend.dto.AdminAuditLogResponse;
import ro.mpp2026.backend.repository.AdminAuditLogRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AdminAuditLogRepository adminAuditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String adminUsername, AuditAction action, String targetEntity, Long targetEntityId, String details) {
        AdminAuditLog log = AdminAuditLog.builder()
                .adminUsername(adminUsername)
                .action(action)
                .targetEntity(targetEntity)
                .targetEntityId(targetEntityId)
                .details(details)
                .build();

        adminAuditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getAllAuditLogs() {
        return adminAuditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getLogsByAdmin(String adminUsername) {
        return adminAuditLogRepository.findByAdminUsernameOrderByTimestampDesc(adminUsername)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getLogsByEntity(String targetEntity, Long targetEntityId) {
        return adminAuditLogRepository.findByTargetEntityAndTargetEntityId(targetEntity, targetEntityId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AdminAuditLogResponse mapToResponse(AdminAuditLog log) {
        return AdminAuditLogResponse.builder()
                .id(log.getId())
                .adminUsername(log.getAdminUsername())
                .action(log.getAction())
                .targetEntity(log.getTargetEntity())
                .targetEntityId(log.getTargetEntityId())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .build();
    }
}
