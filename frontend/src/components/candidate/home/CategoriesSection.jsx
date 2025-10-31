import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import CategoryCard from "./CategoryCard";
// ❌ Local data import ki zaroorat nahi hai
import "../../../styles/candidate/home/CategoriesSection.css";

const API_URL = 'http://localhost:5000/api';
const BACKEND_STATIC_URL = 'http://localhost:5000';

// ❌ Helper function ki zaroorat nahi
// const findCategoryIcon = ...

const CategoriesSection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true); setError(null);
            try {
                // ✅ FIXED: Path /api/data/categories
                const response = await axios.get(`${API_URL}/data/categories`);
                let fetchedCategories = response.data || [];

                // ✅ Construct full image URL
                const categoriesWithFullUrls = fetchedCategories.map(cat => {
                    const imagePath = cat.image || '/icons/default.png';
                    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
                    return { ...cat, image: `${BACKEND_STATIC_URL}${cleanPath}` };
                });
                setCategories(categoriesWithFullUrls.slice(0, 8));
            } catch (err) {
                console.error("Failed to load categories:", err);
                setError("Could not load categories.");
                setCategories([]);
            } finally { setLoading(false); }
        };
        fetchCategories();
    }, []);

    return (
        <div className="categories-section">
            <div className="categories-header">
                <h2>Explore by Category</h2>
                <Link to="/internships" className="view-all-btn"> View All </Link>
            </div>
            <div className="categories-grid">
                {loading ? ( <p>Loading categories...</p> )
                : error ? ( <p className="error-message" style={{color: 'red'}}>{error}</p> )
                : categories.length > 0 ? (
                    categories.map((cat, index) => (
                        <CategoryCard key={cat.title || index} {...cat} />
                    ))
                ) : ( <p>No categories found.</p> )}
            </div>
        </div>
    );
};

export default CategoriesSection;