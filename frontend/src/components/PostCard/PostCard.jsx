import './PostCard.css'
import { useNavigate } from "react-router-dom";
import {FaHeart, FaRegHeart, FaClock, FaUtensils, FaTag, FaUserCircle} from "react-icons/fa";

const formatRecipeType = (type) => {
    if (!type) return "";
    return type
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const PostCard = ({
    recipe,
    isFavorite = false,
    onToggleFavorite = () => {}
}) => {
    const navigate = useNavigate();

    const {
        id,
        title,
        description,
        imageUrl,
        prepTimeMinutes,
        cookingTimeMinutes,
        servings,
        recipeType,
        authorUsername,
        authorAvatarUrl
    } = recipe;

    const totalTime = (prepTimeMinutes || 0) + (cookingTimeMinutes || 0);

    const handleCardClick = () => {
        navigate('/recipe/' + id);
    }

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onToggleFavorite(id);
    };

    return (
        <article className="recipe-card" onClick={handleCardClick} role="button" tabIndex={0}>
            <div className="recipe-image-wrapper">
                <img
                    src={imageUrl || '/placeholder-recipe.jpg'}
                    alt={title}
                    className="recipe-image"
                />
                <button
                    type="button"
                    className={`btn-favorite ${isFavorite ? 'favorite' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            <div className="recipe-body">
                <div className="recipe-top-bar">
                    {recipeType && (
                        <span className="recipe-category">
                            {formatRecipeType(recipeType)}
                        </span>
                    )}
                    {authorUsername && (
                        <div className="recipe-author-wrapper">
                            {authorAvatarUrl ? (
                                <img
                                    src={authorAvatarUrl}
                                    alt={authorUsername}
                                    className="recipe-author-avatar"
                                />
                            ) : (
                                <FaUserCircle className="recipe-author-avatar-fallback" />
                            )}
                            <span className="recipe-author">
                                by <strong>{authorUsername}</strong>
                            </span>
                        </div>
                    )}
                </div>

                <h3 className="recipe-title" title={title}>
                    {title}
                </h3>

                <div className="recipe-desc-container">
                    <p className="recipe-description">{description || 'No description available.'}</p>
                </div>

                <span className="read-more-text">Read more →</span>

                <div className="recipe-meta">
                    {totalTime > 0 && (
                        <span>
                            <FaClock className="meta-icon" /> {totalTime} min
                        </span>
                    )}
                    {servings && (
                        <span>
                            <FaUtensils className="meta-icon" /> {servings} portions
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
};

export default PostCard