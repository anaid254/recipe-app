package ro.mpp2026.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.mpp2026.backend.domain.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite,Long> {
}
