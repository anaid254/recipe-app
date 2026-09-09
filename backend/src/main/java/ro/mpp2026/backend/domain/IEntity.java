package ro.mpp2026.backend.domain;

public interface IEntity<Tid> {
    Tid getId();
    void setId(Tid id);
}
