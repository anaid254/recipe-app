import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar.jsx";
import { FaPlus, FaTrash, FaCloudUploadAlt, FaArrowLeft } from "react-icons/fa";
import "./CreateRecipe.css";
import Button from "../../components/Button/Button.jsx";

const RECIPE_TYPES = [
    {label: "Breakfast", value: "BREAKFAST"},
    {label: "Lunch", value: "LUNCH"},
    {label: "Dinner", value: "DINNER"},
    {label: "Dessert", value: "DESSERT"},
    {label: "Salad", value: "SALAD"},
    {label: "Soup", value: "SOUP"},
    { label: "Snack", value: "SNACK" },
    { label: "Beverage", value: "BEVERAGE" },
];

const MEASURE_UNITS = [
    "g",
    "kg",
    "ml",
    "l",
    "tsp",
    "tbsp",
    "cup",
    "pcs",
    "pinch"
];

const CreateRecipePage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        recipeType: "LUNCH",
        prepTimeMinutes: 15,
        cookingTimeMinutes: 30,
        servings: 2,
        steps: ""
    });

    const [ingredients, setIngredients] = useState([
        {
            name: "",
            quantity: "",
            unit: "g"
        }
    ]);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddIngredient = () => {
        setIngredients(prev => [...prev, {name: "", quantity: "", unit: "g"}]);
    };

    const handleRemoveIngredient = (index) => {
        if (ingredients.length === 1) return;
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (index, field, value) => {
        setIngredients(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!formData.title.trim()) {
            setErrorMessage("Recipe title is required");
            return;
        }

        const validIngredients = ingredients.filter(ingredient => ingredient.name.trim() !== "");
        if (validIngredients.length === 0) {
            setErrorMessage("Add at least one ingredient");
            return;
        }

        setIsSubmitting(true);

        try{
            const recipePayload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                recipeType: formData.recipeType,
                prepTimeMinutes: Number(formData.prepTimeMinutes),
                cookingTimeMinutes: Number(formData.cookingTimeMinutes),
                servings: Number(formData.servings),
                steps: formData.steps.trim(),
                ingredients: validIngredients.map(ing => ({
                    name: ing.name.trim(),
                    quantity: Number(ing.quantity) || 1,
                    unit: ing.unit
                }))
            };

            const recipeRes = await axios.post("/api/recipes", recipePayload);
            const createdRecipeId = recipeRes.data.id;

            if (imageFile) {
                const imgFormData = new FormData();
                imgFormData.append("file", imageFile);

                await axios.post(`/api/recipes/image/${createdRecipeId}`, imgFormData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            navigate("/feed");
        }catch (err) {
            console.error("Error creating recipe", err);
            setErrorMessage(err.response?.data?.message || "Could not save recipe, please try again.");
        } finally {
            setIsSubmitting(false);
        }

    }
    return (
        <div className="cr-page">
            <Navbar />

            <main className="cr-container">
                <div className="cr-header">
                    <h1 className="cr-title">Add a New Recipe</h1>
                    <p className="cr-subtitle">Share your favorite dish with the culinary community.</p>
                </div>

                <form className="cr-form" onSubmit={handleSubmit}>
                    {errorMessage && <div className="cr-error-box">{errorMessage}</div>}

                    <div className="cr-layout-grid">
                        <aside className="cr-left-col">
                            <div className="cr-card cr-upload-card">
                                <label className="cr-section-label">Recipe Image</label>
                                <div className="cr-image-dropzone">
                                    {imagePreview ? (
                                        <div className="cr-preview-container">
                                            <img src={imagePreview} alt="Preview" className="cr-preview-img" />
                                            <label htmlFor="recipe-image-input" className="cr-change-img-overlay">
                                                Change Image
                                            </label>
                                        </div>
                                    ) : (
                                        <label htmlFor="recipe-image-input" className="cr-upload-placeholder">
                                            <FaCloudUploadAlt className="cr-upload-icon" />
                                            <span>Click to choose an image</span>
                                            <small>JPG, JPEG, PNG, GIF, BMP, and WEBP</small>
                                        </label>
                                    )}
                                    <input
                                        id="recipe-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            <div className="cr-card cr-meta-card">
                                <label className="cr-section-label">Preparation Details</label>
                                <div className="cr-form-group">
                                    <label>Prep Time (minutes)</label>
                                    <input
                                        type="number"
                                        name="prepTimeMinutes"
                                        min="0"
                                        value={formData.prepTimeMinutes}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="cr-form-group">
                                    <label>Cooking Time (minutes)</label>
                                    <input
                                        type="number"
                                        name="cookingTimeMinutes"
                                        min="0"
                                        value={formData.cookingTimeMinutes}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="cr-form-group">
                                    <label>Servings</label>
                                    <input
                                        type="number"
                                        name="servings"
                                        min="1"
                                        value={formData.servings}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </aside>

                        <section className="cr-right-col">
                            <div className="cr-card">
                                <div className="cr-form-group">
                                    <label>Recipe Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g., Salmon and Avocado Bowl"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="cr-form-group">
                                    <label>Recipe Type *</label>
                                    <select
                                        name="recipeType"
                                        value={formData.recipeType}
                                        onChange={handleInputChange}
                                    >
                                        {RECIPE_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="cr-form-group">
                                    <label>Short Description</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        placeholder="A short story or presentation of the recipe..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="cr-ingredients-section">
                                    <div className="cr-ingredients-header">
                                        <label className="cr-section-label">Ingredients *</label>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            icon={FaPlus}
                                            onClick={handleAddIngredient}
                                        >
                                            <span className="btn-text">Add Ingredient</span>
                                        </Button>
                                    </div>

                                    <div className="cr-ingredients-rows">
                                        {ingredients.map((ing, index) => (
                                            <div key={index} className="cr-ingredient-row">
                                                <input
                                                    type="text"
                                                    placeholder="Name (e.g., Fresh Salmon)"
                                                    value={ing.name}
                                                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                                                    className="cr-ing-name-input"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Quantity"
                                                    min="0.1"
                                                    step="any"
                                                    value={ing.quantity}
                                                    onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                                                    className="cr-ing-qty-input"
                                                    required
                                                />
                                                <select
                                                    value={ing.unit}
                                                    onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                                                    className="cr-ing-unit-select"
                                                >
                                                    {MEASURE_UNITS.map(unit => (
                                                        <option key={unit} value={unit}>
                                                            {unit.toLowerCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={FaTrash}
                                                    onClick={() => handleRemoveIngredient(index)}
                                                    title="Delete Row"
                                                    disabled={ingredients.length === 1}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="cr-form-group cr-steps-group">
                                    <label>Preparation Instructions (each step on a new line) *</label>
                                    <textarea
                                        name="steps"
                                        rows="6"
                                        placeholder={"1. Put the rice on to cook...\n2. Cut the salmon into equal cubes...\n3. Mix the ingredients for the sauce..."}
                                        value={formData.steps}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    disabled={isSubmitting}
                                    className="cr-submit-btn"
                                >
                                    {isSubmitting ? "Publishing recipe..." : "Publish Recipe"}
                                </Button>
                            </div>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateRecipePage;
