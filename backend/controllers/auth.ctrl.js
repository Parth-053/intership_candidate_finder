const fs = require('fs');
const path = require('path');
// const bcrypt = require('bcryptjs'); // <- Hata diya gaya
const jwt = require('jsonwebtoken');

// Data file paths (same as before)
const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json');
const recruitersPath = path.join(__dirname, '..', 'data', 'recruiters.json');

// Helper functions (same as before)
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

// Register User (without hashing)
exports.registerUser = async (req, res) => { // Removed 'async' as bcrypt is gone
    try {
        const { name, email, password, role, company, position, companyLogo, description, website, locations } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Name, Email, Password, and Role are required." });
        }
        
        if (!['candidate', 'recruiter'].includes(role)) {
             return res.status(400).json({ message: "Invalid role specified." });
        }

        const userFilePath = (role === 'candidate') ? candidatesPath : recruitersPath;
        let users = readData(userFilePath);

        if (users.find(user => user.email === email)) {
            return res.status(400).json({ message: `User with this email already exists as a ${role}.` });
        }
        
        const otherFilePath = (role === 'candidate') ? recruitersPath : candidatesPath;
        let otherUsers = readData(otherFilePath);
         if (otherUsers.find(user => user.email === email)) {
            return res.status(400).json({ message: `User with this email already exists as a ${(role === 'candidate' ? 'recruiter' : 'candidate')}.` });
        }

        // --- Hashing Hata Diya Gaya ---
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);
        const plainPassword = password; // Store password directly
        // -----------------------------

        const userId = `${role}_${new Date().getTime()}`;

        let newUser = {
            id: userId,
            name,
            email,
            password: plainPassword, // Store plain password
            role,
            createdAt: new Date().toISOString(),
        };

        // Add role-specific fields (same as before)
        if (role === 'candidate') {
            newUser = { /* ... candidate fields ... */ }; // Fill candidate fields as before
             newUser = {
                ...newUser,
                headline: "",
                location: "",
                skills: [],
                savedInternships: [],
                profile: { resumeUrl: "" }
            };
        } else { // Recruiter
            newUser = { /* ... recruiter fields ... */ }; // Fill recruiter fields as before
             newUser = {
                ...newUser,
                company: company || "",
                position: position || "",
                companyLogo: companyLogo || "",
                description: description || "",
                website: website || "",
                locations: locations || [],
                profile: {}
            };
        }

        users.push(newUser);
        writeData(userFilePath, users);
        res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully.` });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

// Login User (without hashing comparison)
exports.loginUser = async (req, res) => { // Removed 'async' as bcrypt compare is gone
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required." });
        }

        let user = null;
        let role = null;

        // Find user (same as before)
        let candidates = readData(candidatesPath);
        user = candidates.find(u => u.email === email);
        if (user) {
            role = 'candidate';
        } else {
            let recruiters = readData(recruitersPath);
            user = recruiters.find(u => u.email === email);
            if (user) {
                role = 'recruiter';
            }
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials (user not found)." });
        }

        // --- Hashing Comparison Hata Diya Gaya ---
        // const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = (password === user.password); // Direct comparison
        // ----------------------------------------

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials (password mismatch)." });
        }

        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                const { password, ...userData } = user; // Exclude password from response
                res.status(200).json({
                    token,
                    user: userData
                });
            }
        );
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};