package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.AdminAuditLog;

import java.util.List;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog,Long> {
    List<AdminAuditLog> findAllByOrderByTimestampDesc();

    List<AdminAuditLog> findByAdminUsernameOrderByTimestampDesc(String adminUsername);

    List<AdminAuditLog> findByTargetEntityAndTargetEntityId(String targetEntity, Long targetEntityId);
}
