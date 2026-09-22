import './PostCard.css'

const PostCardComponent = ({recipe}) => {
    const {
        id,
        title,
        description,
        imageUrl,
        prepTimeMinutes,
        cookingTimeMinutes,
        servings,
        user
    } = recipe;

    const totalTime = (prepTimeMinutes || 0) + (cookingTimeMinutes || 0);

    return (
        <article className="recipe-card">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={title}
                    className="recipe-image"
                />
            )}

            <div className="recipe-body">
                {user && (
                    <span className="recipe-author">
                        Postat de <strong>{user.fullName || user.username || 'Anonim'}</strong>
                    </span>
                )}

                <h3 className="recipe-title">{title}</h3>
                <p className="recipe-description">{description}</p>

                <div className="recipe-meta">
                    {totalTime > 0 && <span>⏱ {totalTime} min</span>}
                    {servings && <span>🍽 {servings} porții</span>}
                </div>
            </div>
        </article>
    );
};

export default PostCardComponent