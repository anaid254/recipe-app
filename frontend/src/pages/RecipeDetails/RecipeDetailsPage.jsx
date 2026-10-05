import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from '../../api/axios';
import Navbar from "../../components/Navbar/Navbar.jsx";
import { FaClock, FaUtensils, FaUserCircle, FaStar, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
import "./RecipeDetails.css";
import AuthContext from "../../context/AuthProvider.jsx";


const RECIPES_URL = "/api/recipes";
const REVIEWS_URL = "/api/reviews";

const formatRecipeType = (type) => {
    if (!type) return '';
    return type
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const Stars = ({ value }) => (
    <span className="rd-stars">
        {[1, 2, 3, 4, 5].map((s) => (
            <FaStar key={s} className={`rd-star-static ${Math.round(value) >= s ? "filled" : ""}`} />
        ))}
    </span>
);

const RecipeDetailsPage = () => {
    const { id } = useParams();
    const { auth } = useContext(AuthContext);
    const currentUsername = auth?.username;


    const [recipe, setRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [newRating, setNewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editHoverRating, setEditHoverRating] = useState(0);
    const [editComment, setEditComment] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get(`${RECIPES_URL}/${id}`);
                setRecipe(response.data);
            } catch (err) {
                console.error("Error fetching recipe", err);
                setError("Could not load recipe");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecipes();
    }, [id]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${REVIEWS_URL}/recipe/${id}`);
                setReviews(response.data);
            } catch (err) {
                console.error("Error fetching reviews", err);
                setReviewError("Could not load reviews");
            }
        };

        if (id) {
            fetchReviews();
        }
    }, [id]);

    const fetchAverageRating = async () => {
        try {
            const response = await axios.get(`${REVIEWS_URL}/recipe/${id}/rating`);
            setAvgRating(response.data);
        } catch (err) {
            console.error("Error fetching rating", err);
        }
    };

    useEffect(() => {
        if (id) fetchAverageRating();
    }, [id]);

    if (isLoading) {
        return (
            <div className="rd-page">
                <Navbar />
                <p className="rd-status-message">Loading recipe details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rd-page">
                <Navbar />
                <p className="rd-status-message rd-error">{error}</p>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="rd-page">
                <Navbar />
                <p className="rd-status-message">Recipe not found.</p>
            </div>
        );
    }

    const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookingTimeMinutes || 0);
    const reviewCount = reviews.length;

    const stepList = recipe.steps
        ? recipe.steps.split('\n').filter(step => step.trim() !== '')
        : [];

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setReviewError("Comment cannot be empty");
            return;
        }
        setIsSubmitting(true);
        setReviewError("");

        try {
            const response = await axios.post(`${REVIEWS_URL}/recipe/${id}`, {
                rating: newRating,
                comment: newComment.trim()
            });

            setReviews([response.data, ...reviews]);
            fetchAverageRating();
            setNewComment("");
            setNewRating(5);
        } catch (error) {
            console.error("Error adding review", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setReviewError("You need to be logged in.");
            } else if (error.response?.status === 400) {
                setReviewError(
                    error.response?.data?.message ||
                    "You can't review your own recipe or review it twice."
                );
            } else {
                setReviewError(error.response?.data?.message || "Failed to save review.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (rev) => {
        setEditingReviewId(rev.id);
        setEditRating(rev.rating);
        setEditComment(rev.comment);
        setEditHoverRating(0);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditComment("");
    };

    const handleSaveEdit = async (reviewId) => {
        if (!editComment.trim()) return;
        setIsSavingEdit(true);

        try {
            const response = await axios.put(`${REVIEWS_URL}/recipe/${id}`, {
                rating: editRating,
                comment: editComment.trim()
            });

            setReviews(reviews.map((r) => (r.id === reviewId ? response.data : r)));
            setEditingReviewId(null);
            fetchAverageRating();
        } catch (err) {
            console.error("Error updating review", err);
            alert(err.response?.data?.message || "Failed to update review.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete your review?")) {
            return;
        }

        try {
            await axios.delete(`${REVIEWS_URL}/${reviewId}`);
            setReviews(reviews.filter((r) => r.id !== reviewId));
            fetchAverageRating();
        } catch (err) {
            console.error("Error deleting review", err);
            alert(err.response?.data?.message || "Failed to delete review.");
        }
    };

    return (
        <div className="rd-page">
            <Navbar />

            <main className="rd-container">
                <header className={`rd-card rd-hero ${!recipe.imageUrl ? 'rd-hero--no-image' : ''}`}>
                    <div className="rd-hero-info">
                        {recipe.recipeType && (
                            <span className="rd-type-badge">{formatRecipeType(recipe.recipeType)}</span>
                        )}

                        <h1 className="rd-title">{recipe.title}</h1>

                        {reviewCount > 0 ? (
                            <a href="#reviews" className="rd-hero-rating">
                                <Stars value={avgRating} />
                                <strong>{avgRating.toFixed(1)}</strong>
                                <span>({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
                            </a>
                        ) : (
                            <span className="rd-hero-rating rd-hero-rating--empty">No reviews yet</span>
                        )}

                        {recipe.description && (
                            <p className="rd-description-lead">{recipe.description}</p>
                        )}

                        <div className="rd-author-meta-row">
                            <div className="rd-author-box">
                                {recipe.authorAvatarUrl ? (
                                    <img src={recipe.authorAvatarUrl} alt={recipe.authorUsername} className="rd-author-avatar-img" />
                                ) : (
                                    <FaUserCircle className="rd-author-avatar-fallback" />
                                )}
                                <div className="rd-author-text">
                                    <span className="rd-author-label">Recipe by</span>
                                    <strong className="rd-author-name">{recipe.authorUsername || "Chef"}</strong>
                                </div>
                            </div>

                            <div className="rd-stats-box">
                                {totalTime > 0 && (
                                    <span className="rd-stat-item"><FaClock className="rd-stat-icon" /> {totalTime} min</span>
                                )}
                                {recipe.servings && (
                                    <span className="rd-stat-item"><FaUtensils className="rd-stat-icon" /> {recipe.servings} portions</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {recipe.imageUrl && (
                        <div className="rd-hero-image-wrapper">
                            <img src={recipe.imageUrl} alt={recipe.title} className="rd-hero-image" />
                        </div>
                    )}
                </header>

                <div className="rd-content-grid">
                    <aside className="rd-card rd-ingredients-card">
                        <h2 className="rd-section-title">Ingredients</h2>
                        <ul className="rd-ingredients-list">
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                recipe.ingredients.map((item, index) => (
                                    <li key={index} className="rd-ingredient-item">
                                        <span className="rd-ingredient-name">{item.name}</span>
                                        <span className="rd-ingredient-qty">
                                            {item.quantity} {item.unit ? item.unit.toLowerCase() : ''}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="rd-empty-text">No ingredients listed.</li>
                            )}
                        </ul>
                    </aside>

                    <section className="rd-card rd-instructions-card">
                        <h2 className="rd-section-title">Instructions</h2>
                        <ol className="rd-instructions-list">
                            {stepList.length > 0 ? (
                                stepList.map((stepText, index) => (
                                    <li key={index} className="rd-instruction-step">
                                        <div className="rd-step-badge">{index + 1}</div>
                                        <p className="rd-step-description">{stepText.replace(/^\d+\.\s*/, '')}</p>
                                    </li>
                                ))
                            ) : (
                                <li className="rd-empty-text">No instructions provided.</li>
                            )}
                        </ol>
                    </section>
                </div>

                <section className="rd-bottom-section" id="reviews">
                    <div className="rd-card">
                        <div className="rd-reviews-header">
                            <h2 className="rd-section-title">Community Reviews</h2>
                            {reviewCount > 0 && (
                                <div className="rd-rating-summary">
                                    <span className="rd-rating-big">{avgRating.toFixed(1)}</span>
                                    <div>
                                        <Stars value={avgRating} />
                                        <span className="rd-rating-count">
                                            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="rd-review-form" onSubmit={handleReviewSubmit}>
                            <div className="rd-rating-select">
                                <span className="rd-rating-label">Your rating:</span>
                                <div className="rd-stars-picker">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`rd-star-picker-icon ${(hoverRating || newRating) >= star ? "active" : ""}`}
                                            onClick={() => setNewRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <textarea
                                className="rd-review-input"
                                placeholder="Tell others how your preparation went..."
                                rows="3"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />

                            {reviewError && <p className="rd-error-text">{reviewError}</p>}

                            <button type="submit" className="rd-submit-review-btn" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Add Review"}
                            </button>
                        </form>

                        <div className="rd-reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map((rev) => {
                                    const isOwner = Boolean(
                                        currentUsername &&
                                        rev.username &&
                                        currentUsername.trim().toLowerCase() === rev.username.trim().toLowerCase()
                                    );
                                    const isEditing = editingReviewId === rev.id;

                                    return (
                                        <div key={rev.id} className="rd-review-item">
                                            <div className="rd-review-header">
                                                <div className="rd-reviewer-info">
                                                    {rev.userAvatarUrl ? (
                                                        <img src={rev.userAvatarUrl} alt={rev.username} className="rd-reviewer-avatar" />
                                                    ) : (
                                                        <FaUserCircle className="rd-reviewer-fallback" />
                                                    )}
                                                    <div>
                                                        <span className="rd-reviewer-name">{rev.username}</span>
                                                        {rev.createdAt && (
                                                            <span className="rd-review-date">
                                                                {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                                                                    day: "numeric", month: "short", year: "numeric"
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="rd-review-header-right">
                                                    {!isEditing && <Stars value={rev.rating} />}
                                                    {isOwner && !isEditing && (
                                                        <div className="rd-review-actions">
                                                            <button
                                                                type="button"
                                                                className="rd-action-btn rd-edit-btn"
                                                                onClick={() => handleStartEdit(rev)}
                                                                title="Edit review"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="rd-action-btn rd-delete-btn"
                                                                onClick={() => handleDeleteReview(rev.id)}
                                                                title="Delete review"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isEditing ? (
                                                <div className="rd-edit-review-box">
                                                    <div className="rd-rating-select">
                                                        <span className="rd-rating-label">Rating nou:</span>
                                                        <div className="rd-stars-picker">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <FaStar
                                                                    key={star}
                                                                    className={`rd-star-picker-icon ${(editHoverRating || editRating) >= star ? "active" : ""}`}
                                                                    onClick={() => setEditRating(star)}
                                                                    onMouseEnter={() => setEditHoverRating(star)}
                                                                    onMouseLeave={() => setEditHoverRating(0)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        className="rd-review-input rd-edit-textarea"
                                                        rows="3"
                                                        value={editComment}
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                    />

                                                    <div className="rd-edit-actions">
                                                        <button
                                                            type="button"
                                                            className="rd-btn-save-edit"
                                                            onClick={() => handleSaveEdit(rev.id)}
                                                            disabled={isSavingEdit || !editComment.trim()}
                                                        >
                                                            <FaCheck /> {isSavingEdit ? "Saving..." : "Save"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="rd-btn-cancel-edit"
                                                            onClick={handleCancelEdit}
                                                            disabled={isSavingEdit}
                                                        >
                                                            <FaTimes /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="rd-review-text">{rev.comment}</p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="rd-empty-text">Be the first one to leave a review!</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RecipeDetailsPage;
