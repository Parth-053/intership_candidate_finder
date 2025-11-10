//
const { db } = require('../firebase-admin');

class AuthController {
  
  /**
   * @desc    Register user details in Firestore (AFTER Firebase Auth)
   * @route   POST /api/auth/register
   */
  async registerUser(req, res) {
    try {
        // user object (jismein uid, email, role hai) frontend se aayega
        const { uid, email, name, role, company, position } = req.body;

        if (!uid || !email || !name || !role) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        let collectionName = '';
        let userData = {};

        if (role === 'candidate') {
            collectionName = 'candidates';
            userData = {
                id: uid, name, email, role, createdAt: new Date().toISOString(),
                headline: "", location: "", skills: [], savedInternships: [],
                profile: { resumeUrl: "" }
            };
        } else if (role === 'recruiter') {
            collectionName = 'recruiters';
            userData = {
                id: uid, name, email, role, company, position, createdAt: new Date().toISOString(),
                companyLogo: "/icons/default-logo.png", description: "",
                website: "", locations: []
            };
        } else {
            return res.status(400).json({ message: "Invalid role." });
        }

        // ✅ Firestore mein data save karein (UID ko document ID banayein)
        await db.collection(collectionName).doc(uid).set(userData);

        res.status(201).json({ message: "User profile created in Firestore.", user: userData });

    } catch (error) {
        console.error("Firestore Register Error:", error);
        res.status(500).json({ message: "Server error creating user profile." });
    }
  }

  /**
   * @desc    Login (Ab zaroorat nahi)
   */
  async loginUser(req, res) {
    // Yeh logic ab frontend se seedha Firebase Authentication handle karega
    // Is backend endpoint ki ab zaroorat nahi hai
    res.status(400).json({ message: "Login is handled by Firebase Client SDK. This endpoint is deprecated." });
  }
}

module.exports = new AuthController();