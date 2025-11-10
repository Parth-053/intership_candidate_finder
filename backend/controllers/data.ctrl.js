const { db } = require('../firebase-admin');
const fs = require('fs');
const path = require('path');

const categoriesIconPath = path.join(__dirname, '..', 'data', 'categories.json');
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { console.error(`Read Error ${filePath}:`, error); return []; }
};

class DataController {

  /**
   * @desc    Get distinct companies with logos
   * @route   GET /api/data/companies
   */
  async getDistinctCompanies(req, res) {
    try {
      const snapshot = await db.collection('recruiters').get();
      
      const companyMap = new Map();
      snapshot.forEach(doc => {
          const data = doc.data();
          if (data.company && !companyMap.has(data.company.toLowerCase())) {
              companyMap.set(data.company.toLowerCase(), {
                  name: data.company,
                  logo: data.companyLogo || '/icons/default-logo.png'
              });
          }
      });
      
      const companiesWithLogos = Array.from(companyMap.values());
      res.status(200).json(companiesWithLogos);
      
    } catch (error) {
      console.error("Error getting distinct companies:", error);
      res.status(500).json({ message: "Server error fetching companies." });
    }
  }

  /**
   * @desc    Get distinct categories with icons
   * @route   GET /api/data/categories
   */
  async getDistinctCategories(req, res) {
    try {
      const snapshot = await db.collection('categories').get();
      
      if (snapshot.empty) {
          console.warn("Categories collection empty, reading from JSON file as fallback...");
          const fileData = readData(categoriesIconPath); // Fallback
          return res.status(200).json(fileData);
      }

      const categories = [];
      snapshot.forEach(doc => {
          categories.push(doc.data());
      });

      res.status(200).json(categories);
      
    } catch (error) {
      console.error("Error getting distinct categories:", error);
      res.status(500).json({ message: "Server error fetching categories." });
    }
  }

  /**
   * @desc    Get distinct locations from internships
   * @route   GET /api/data/locations
   * @access  Public
   */
  async getDistinctLocations(req, res) {
    try {
      // Yeh query poore 'internships' collection ko scan karegi
      const snapshot = await db.collection('internships').get();
      
      const locationSet = new Set();
      snapshot.forEach(doc => {
          const data = doc.data();
          if (data.location) {
              locationSet.add(data.location);
          }
      });
      
      const locations = Array.from(locationSet).sort();
      res.status(200).json(locations);
      
    } catch (error) {
      console.error("Error getting distinct locations:", error);
      res.status(500).json({ message: "Server error fetching locations." });
    }
  }
}

module.exports = new DataController();