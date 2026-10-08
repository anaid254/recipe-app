import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PostCard from "../../components/PostCard/PostCard";
import Navbar from "../../components/Navbar/Navbar.jsx";
import axios from "../../api/axios";
import "./Feed.css";

const RECIPES_URL = "/api/recipes";
const FAVORITES_URL = "/api/favorites";

const RECIPE_TYPES = [
    { label: "All", value: "ALL" },
    { label: "Breakfast", value: "BREAKFAST" },
    { label: "Lunch", value: "LUNCH" },
    { label: "Dinner", value: "DINNER" },
    { label: "Soup", value: "SOUP" },
    { label: "Salad", value: "SALAD" },
    { label: "Dessert", value: "DESSERT" },
    { label: "Snack", value: "SNACK" },
    { label: "Beverage", value: "BEVERAGE" },
];

const FeedPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const [recipes, setRecipes] = useState([]);
    const [selectedType, setSelectedType] = useState("ALL");
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let url = RECIPES_URL;
                const params = {};

                if (searchQuery.trim()) {
                    url = `${RECIPES_URL}/search`;
                    params.title = searchQuery.trim();
                } else if (selectedType !== "ALL") {
                    url = `${RECIPES_URL}/type`;
                    params.recipeType = selectedType;
                }

                const [recipesRes, favoritesRes] = await Promise.all([
                    axios.get(url, { params }),
                    axios.get(FAVORITES_URL)
                ]);

                if (isMounted) {
                    const recipesData = Array.isArray(recipesRes.data)
                        ? recipesRes.data
                        : (recipesRes.data?.content || []);
                    setRecipes(recipesData);

                    const favList = Array.isArray(favoritesRes.data) ? favoritesRes.data : [];
                    const ids = new Set(favList.map((fav) => fav.recipeId || fav.id));
                    setFavoriteIds(ids);
                }
            } catch (err) {
                console.error("Eroare la încărcare:", err);
                if (isMounted) {
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        navigate("/login", { replace: true });
                    } else {
                        setError("Couldn't load recipes");
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
    }, [searchQuery, selectedType, navigate]);

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
                {!searchQuery && (
                    <div className="category-scroll-container">
                        <div className="category-pill-list">
                            {RECIPE_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`category-pill ${selectedType === type.value ? "active" : ""}`}
                                    onClick={() => setSelectedType(type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {searchQuery && (
                    <div className="search-query-header">
                        <h2>
                            Results for "<span>{searchQuery}</span>"
                        </h2>
                        <button
                            type="button"
                            className="btn-clear-search"
                            onClick={() => navigate("/feed")}
                        >
                            Show all recipes
                        </button>
                    </div>
                )}

                <main className="feed-grid">
                    {isLoading && <p className="status-text">Loading delicious recipes...</p>}

                    {!isLoading && error && (
                        <p className="status-text error">{error}</p>
                    )}

                    {!isLoading && !error && recipes.length === 0 && (
                        <p className="status-text">No recipes found for this selection.</p>
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