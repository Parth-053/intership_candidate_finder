import React, { useState } from "react";
import "../../../styles/candidate/internship/Sidebar.css";

const Sidebar = ({ selections, onFilterChange, onToggle, categories, companies, locations }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // Generate duration options (1 month to 12 months in 0.5 increments)
    const durationOptions = Array.from({ length: 23 }, (_, i) => {
        const value = 1 + i * 0.5;
        return `${value} month${value > 1 ? 's' : ''}`;
    });

    const stipendOptions = [
        "0-10000",
        "10000-25000",
        "25000-50000",
        "50000-100000",
        "100000-200000", // Adjusted ranges slightly
        "200000-500000",
        // "500000-1000000" // Maybe too high?
    ];

    // ✅ Use standardized, singular keys. Ensure options are arrays of strings.
    const filterConfig = [
        { name: "Category", icon: "💻", options: Array.isArray(categories) ? categories : [], type: 'checkbox' },
        { name: "Company", icon: "🏢", options: Array.isArray(companies) ? companies : [], type: 'checkbox' },
        { name: "Location", icon: "📍", options: Array.isArray(locations) ? locations : [], type: 'checkbox' },
        { name: "Mode", icon: "🏠", options: ["Remote", "On-site", "Hybrid"], type: 'checkbox' }, // Match backend data
        { name: "Duration", icon: "⏳", options: durationOptions, type: 'checkbox' },
        { name: "Stipend", icon: "💰", options: stipendOptions, type: 'checkbox' },
        // { name: "Timing", icon: "⏰", options: ["Part Time", "Full Time"], type: 'checkbox' }, // Add if needed
    ];

    const handleFilterClick = (filterName) => {
        if (isCollapsed) {
            setIsCollapsed(false); // Expand sidebar if collapsed when clicking a filter
            onToggle(false); // Notify parent
        }
        setActiveFilters(prev =>
            prev.includes(filterName)
                ? prev.filter(f => f !== filterName)
                : [...prev, filterName]
        );
    };

    const handleToggle = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        onToggle(newState); // Notify parent about collapse state change
        if (newState) {
             setActiveFilters([]); // Collapse all filter options when sidebar collapses
        }
    };

    return (
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                {!isCollapsed && <h3 className="sidebar-title">Filters</h3>}
                <button className="toggle-btn" onClick={handleToggle}>
                    {isCollapsed ? "→" : "←"}
                </button>
            </div>
            <nav className="filter-nav">
                <ul>
                    {filterConfig.map((filter) => {
                        const isActive = activeFilters.includes(filter.name);
                        // Ensure options is always an array
                        const options = Array.isArray(filter.options) ? filter.options : [];
                        return (
                            <li key={filter.name}>
                                <div
                                    className={`filter-item ${isActive ? "active" : ""}`}
                                    onClick={() => handleFilterClick(filter.name)}
                                >
                                    <span className="filter-icon">{filter.icon}</span>
                                    {!isCollapsed && <span className="filter-name">{filter.name}</span>}
                                    {/* Optionally show count of selected items */}
                                    {/* {!isCollapsed && (selections[filter.name]?.length || 0) > 0 &&
                                        <span className="selected-count">({selections[filter.name].length})</span>
                                    } */}
                                </div>
                                {!isCollapsed && isActive && (
                                    <div className="filter-options">
                                        {/* Display message if options are missing */}
                                        {options.length === 0 && <p className="no-options">No options available</p>}
                                        {/* Render options */}
                                        {options.length > 0 && options.map((option) => (
                                            <label key={option} className="option-label">
                                                <input
                                                    type={filter.type} // Checkbox
                                                    name={filter.name}
                                                    value={option}
                                                    // Check if this specific option is in the selections array for this filterName
                                                    checked={(selections[filter.name] || []).includes(option)}
                                                    onChange={() => onFilterChange(filter.name, option)} // Parent handles state
                                                />
                                                {/* Format stipend display */}
                                                {filter.name === 'Stipend' ? `₹${option.replace('-', ' - ₹')}` : option}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;