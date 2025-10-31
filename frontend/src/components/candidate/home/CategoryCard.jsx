import React from "react";
import "../../../styles/candidate/home/CategoryCard.css";

const BACKEND_STATIC_URL = 'http://localhost:5000'; // Fallback ke liye

const CategoryCard = ({ title, image }) => {
  return (
    <div className="category-card">
      {/* ✅ 'image' prop (full URL) ko seedha use karein */}
      <img
          src={image} // Expects http://localhost:5000/icons/web.png
          alt={title}
          onError={(e) => { e.target.src = `${BACKEND_STATIC_URL}/icons/default.png`; }}
       />
      <p>{title}</p>
    </div>
  );
};

export default CategoryCard;