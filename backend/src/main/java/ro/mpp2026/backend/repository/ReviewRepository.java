package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.Review;

public interface ReviewRepository extends JpaRepository<Review,Long> {
}
