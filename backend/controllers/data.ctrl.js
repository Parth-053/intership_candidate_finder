const fs = require('fs');
const path = require('path');

// Data file paths
const recruitersPath = path.join(__dirname, '..', 'data', 'recruiters.json');
const internshipsPath = path.join(__dirname, '..', 'data', 'available_internships.json');
const categoriesIconPath = path.join(__dirname, '..', 'data', 'categories.json'); // ✅ Path to categories icon data

// Helper function
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { console.error(`Read Error ${filePath}:`, error); return []; }
};

// Function to get distinct companies (No changes needed here)
exports.getDistinctCompanies = (req, res) => {
    // ... (existing code for companies) ...
     try {
        const recruiters = readData(recruitersPath);
        const companiesMap = new Map();
        recruiters.forEach(recruiter => {
            if (recruiter.company && !companiesMap.has(recruiter.company.toLowerCase())) {
                companiesMap.set(recruiter.company.toLowerCase(), {
                    name: recruiter.company,
                    logo: recruiter.companyLogo || '/icons/default-logo.png' // Default logo path
                });
            }
        });
        const distinctCompanies = Array.from(companiesMap.values());
        res.status(200).json(distinctCompanies);
    } catch (error) {
        console.error("Error getting distinct companies:", error);
        res.status(500).json({ message: "Server error fetching companies." });
    }
};

// ✅ Updated Function to get distinct categories WITH icons
exports.getDistinctCategories = (req, res) => {
    try {
        const internships = readData(internshipsPath);
        const categoryIconData = readData(categoriesIconPath); // Read the icon data

        // Create a lookup map for icons (lowercase title -> image path)
        const iconMap = new Map();
        if (Array.isArray(categoryIconData)) {
            categoryIconData.forEach(cat => {
                if (cat.title && cat.image) {
                    iconMap.set(cat.title.toLowerCase(), cat.image); // Store lowercase title -> image path
                }
            });
        }

        const categoriesSet = new Set();
        internships.forEach(internship => {
            // Extract category title (using the same logic as before)
            if (internship.title) {
                 const potentialCategory = internship.title.split(/ Intern| Developer| Analyst| Designer| Specialist| Manager/i)[0].trim();
                 if (potentialCategory) {
                    categoriesSet.add(potentialCategory);
                 } else {
                     categoriesSet.add(internship.title.trim()); // Fallback
                 }
            }
        });

        // Convert Set to an array of objects, adding the image path from the map
        const distinctCategories = Array.from(categoriesSet).map(title => {
            const titleLower = title.toLowerCase();
            // Find icon, provide default if not found
            const imagePath = iconMap.get(titleLower) || '/icons/default.png'; // Default icon path
            return {
                title: title,
                image: imagePath // Image path relative to backend public folder
            };
        });

        res.status(200).json(distinctCategories); // Send the list [{ title: "...", image: "/icons/..." }]

    } catch (error) {
        console.error("Error getting distinct categories:", error);
        res.status(500).json({ message: "Server error fetching categories." });
    }
};