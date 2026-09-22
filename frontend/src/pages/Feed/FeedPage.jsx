import {useEffect, useState, useContext} from "react";
import PostCard from "../../components/PostCard/PostCard";
import "./Feed.css";
import Navbar from "../../components/Navbar/Navbar.jsx";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";

const RECIPES_URL = "/api/recipes";

const FeedPage = () => {
    const {auth} = useContext(AuthContext);
    const navigate = useNavigate();

    const [recipes, setRecipes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const token = auth?.accessToken || localStorage.getItem("token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchRecipes = async () => {
            try {
                const response = await axios.get(RECIPES_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (isMounted) {
                    const data = Array.isArray(response.data)
                        ? response.data
                        : (response.data?.content || []);

                    setRecipes(data);
                }
            } catch (err) {
                console.error("Eroare la fetchRecipes:", err);
                if (isMounted) {
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        localStorage.removeItem("token");
                        navigate("/login", { replace: true });
                    } else {
                        setErrMsg("Couldn't find any recipe");
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchRecipes();

        return () => {
            isMounted = false;
        };
    }, [auth?.accessToken, navigate]);

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
                        <PostCard key={recipe.id} recipe={recipe} />
                    ))}
                </main>
            </div>
        </div>
    );
};

export default FeedPage;