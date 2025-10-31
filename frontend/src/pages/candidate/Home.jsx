import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate import karein
import TopNavbar from "../../components/candidate/common/TopNavbar";
import HeroSection from "../../components/candidate/home/HeroSection";
import SearchBar from "../../components/candidate/home/SearchBar";
import CategoriesSection from "../../components/candidate/home/CategoriesSection";
import TopCompanies from "../../components/candidate/home/TopCompanies";
import LatestInternships from "../../components/candidate/home/LatestInternships";
import Footer from "../../components/candidate/common/Footer";
import "../../styles/candidate/home/HomePage.css";

const Home = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate(); // ✅ navigate function initialize karein

  // ✅ Yeh function search ko handle karega
  const handleHomePageSearch = () => {
    if (query.trim()) {
      // User ko internship page par bhej dein, search query ke saath
      navigate(`/internships?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="app-container">
      <div className="top-navbar-sticky-container">
        <TopNavbar />
      </div>
      <HeroSection />
      <div className="search-bar-sticky-container">
        {/* ✅ SearchBar ko state aur function pass karein */}
        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          onSearch={handleHomePageSearch} 
        />
      </div>
      <CategoriesSection />
      <TopCompanies />
      <LatestInternships />
      <Footer />
    </div>
  );
};

export default Home;