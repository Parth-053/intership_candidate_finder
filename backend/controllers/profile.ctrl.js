const fs = require('fs');
const path = require('path');

// Updated paths
const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json');
const recruitersPath = path.join(__dirname, '..', 'data', 'recruiters.json');

// Helper functions (same as auth.ctrl.js)
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { console.error(`Read Error ${filePath}:`, error); return []; }
};
const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) { console.error(`Write Error ${filePath}:`, error); }
};

// PROTECTED - LOGGED-IN USER - Get own profile
exports.getMyProfile = (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userFilePath = (userRole === 'candidate') ? candidatesPath : recruitersPath;
        
        let users = readData(userFilePath);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const { password, ...profileData } = user; // Exclude password
        res.status(200).json(profileData);
        
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server error fetching profile." });
    }
};

// PROTECTED - LOGGED-IN USER - Update own profile
exports.updateMyProfile = (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userFilePath = (userRole === 'candidate') ? candidatesPath : recruitersPath;
        
        let users = readData(userFilePath);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found." });
        }
        
        // Update user data - merge existing with new, prevent changing id/role/email/password here
        const { id, role, email, password, createdAt, ...updateData } = req.body;
        users[userIndex] = { 
            ...users[userIndex], 
            ...updateData,
            // Deep merge profile object if it exists
            profile: { ...(users[userIndex].profile || {}), ...(updateData.profile || {}) } 
        };

        // If 'name' is updated at top level, ensure it's saved
         if (req.body.name) {
             users[userIndex].name = req.body.name;
         }

        writeData(userFilePath, users);
        
        const { password: _, ...updatedUser } = users[userIndex]; // Exclude password from response
        res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });
        
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error updating profile." });
    }
};

// PROTECTED - CANDIDATE - Toggle save/unsave internship
exports.saveInternshipToggle = (req, res) => {
    try {
        const candidateId = req.user.id;
        // Make sure internshipId is treated as a number if IDs are numbers
        const internshipId = parseInt(req.params.internshipId, 10);
        
        // Only candidates can save internships
        if (req.user.role !== 'candidate') {
            return res.status(403).json({ message: "Only candidates can save internships." });
        }
        
        let candidates = readData(candidatesPath);
        const userIndex = candidates.findIndex(u => u.id === candidateId);

        if (userIndex === -1) {
             return res.status(404).json({ message: "Candidate not found." });
        }

        // Initialize savedInternships if it doesn't exist
        if (!Array.isArray(candidates[userIndex].savedInternships)) {
             candidates[userIndex].savedInternships = [];
        }
        
        const savedIndex = candidates[userIndex].savedInternships.indexOf(internshipId);
        
        let message = "";
        if (savedIndex > -1) {
            // Unsave
            candidates[userIndex].savedInternships.splice(savedIndex, 1);
            message = "Internship removed from saved list.";
        } else {
            // Save
            candidates[userIndex].savedInternships.push(internshipId);
            message = "Internship saved successfully.";
        }
        
        writeData(candidatesPath, candidates);
        res.status(200).json({ message, savedInternships: candidates[userIndex].savedInternships });

    } catch (error) {
        console.error("Save Toggle Error:", error);
        res.status(500).json({ message: "Server error saving internship." });
    }
};