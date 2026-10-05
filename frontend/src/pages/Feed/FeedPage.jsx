import {useEffect, useState, useContext} from "react";
import PostCard from "../../components/PostCard/PostCard";
import "./Feed.css";
import Navbar from "../../components/Navbar/Navbar.jsx";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";

const RECIPES_URL = "/api/recipes";
const FAVORITES_URL = "/api/favorites";

const FeedPage = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState({});
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [recipesRes, favoritesRes] = await Promise.all([
                    axios.get(RECIPES_URL),
                    axios.get(FAVORITES_URL)
                ]);

                if (isMounted) {
                    const recipesData = Array.isArray(recipesRes.data)
                        ? recipesRes.data
                        : (recipesRes.data?.content || []);
                    setRecipes(recipesData);

                    const favList = Array.isArray(favoritesRes.data) ? favoritesRes.data : [];
                    const ids = new Set(favList.map(fav => fav.recipeId || fav.id));
                    setFavoriteIds(ids);
                }
            } catch (err) {
                console.error("Eroare la încărcare:", err);
                if (isMounted) {
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        navigate("/login", { replace: true });
                    } else {
                        setError("Couldn't load data");
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleToggleFavorite = async (recipeId) => {
        const isFav = favoriteIds.has(recipeId);

        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (isFav) {
                next.delete(recipeId);
            } else {
                next.add(recipeId);
            }
            return next;
        });

        try {
            if (isFav) {
                await axios.delete(`${FAVORITES_URL}/${recipeId}`);
            } else {
                await axios.post(`${FAVORITES_URL}/${recipeId}`);
            }
        } catch (err) {
            console.error("Error at favorite:", err);
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (isFav) {
                    next.add(recipeId);
                } else {
                    next.delete(recipeId);
                }
                return next;
            });
        }
    };

    return (
        <div className="feed-wrapper">
            <Navbar />
            <div className="feed-container">
                <main className="feed-grid">
                    {isLoading && <p className="status-text">Loading recipes...</p>}

                    {!isLoading && error && (
                        <p className="status-text error">{error}</p>
                    )}

                    {!isLoading && !error && recipes.length === 0 && (
                        <p className="status-text">No recipes found.</p>
                    )}

                    {!isLoading && recipes.map((recipe) => (
                        <PostCard
                            key={recipe.id}
                            recipe={recipe}
                            isFavorite={favoriteIds.has(recipe.id)}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))}
                </main>
            </div>
        </div>
    );
};

export default FeedPage;