import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import axios from "../../api/axios";
import "./SearchBar.css";

const SearchBar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const trimmed = searchTerm.trim();
        if (!trimmed) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("/api/recipes/search", {
                    params: { title: trimmed }
                });
                setResults(response.data || []);
                setIsOpen(true);
            } catch (error) {
                console.error("Error searching recipes:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleSelectRecipe = (recipeId) => {
        setIsOpen(false);
        setSearchTerm("");
        navigate(`/recipe/${recipeId}`);
    };

    const handleClear = () => {
        setSearchTerm("");
        setResults([]);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchTerm.trim()) {
            setIsOpen(false);
            navigate(`/feed?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="search-container" ref={containerRef}>
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                />
                {searchTerm && (
                    <button type="button" className="search-clear-btn" onClick={handleClear}>
                        <FaTimes />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="search-dropdown">
                    {isLoading ? (
                        <div className="search-status">Searching...</div>
                    ) : results.length > 0 ? (
                        <ul className="search-results-list">
                            {results.map((recipe) => (
                                <li
                                    key={recipe.id}
                                    className="search-result-item"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectRecipe(recipe.id);
                                    }}
                                >
                                    <img
                                        src={recipe.imageUrl || "/placeholder-recipe.jpg"}
                                        alt={recipe.title}
                                        className="search-result-img"
                                    />
                                    <div className="search-result-info">
                                        <span className="search-result-title">{recipe.title}</span>
                                        <span className="search-result-meta">
                                            {recipe.recipeType} • {(recipe.prepTimeMinutes || 0) + (recipe.cookingTimeMinutes || 0)} min
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="search-status">No recipes found for "{searchTerm}"</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;