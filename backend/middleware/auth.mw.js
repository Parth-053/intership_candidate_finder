const { db, auth, admin } = require('../firebase-admin.js'); // ✅ .js YAHAN ADD KAREIN

// 1. Check karta hai ki user logged-in hai ya nahi (Firebase se)
exports.isAuthenticated = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    
    const token = authHeader.split(' ')[1]; // Firebase token from frontend
    if (!token) {
        return res.status(401).json({ message: 'Token format incorrect.' });
    }

    try {
        // ✅ Firebase token ko verify karein
        const decodedToken = await auth.verifyIdToken(token);
        
        // ✅ Decoded token se user data (Firestore se) fetch karein
        let userDoc, userRole;
        
        // SAHI TAREQA: 'db.collection' ka istemaal karein
        const candidateDoc = await db.collection('candidates').doc(decodedToken.uid).get();
        
        if (candidateDoc.exists) {
            userDoc = candidateDoc.data();
            userRole = 'candidate';
        } else {
            // SAHI TAREQA: 'db.collection' ka istemaal karein
            const recruiterDoc = await db.collection('recruiters').doc(decodedToken.uid).get();
            if (recruiterDoc.exists) {
                userDoc = recruiterDoc.data();
                userRole = 'recruiter';
            }
        }
        
        if (!userDoc) {
             return res.status(404).json({ message: 'User not found in Firestore.' });
        }

        // ✅ req.user mein Firebase UID aur role daalein
        req.user = {
            id: decodedToken.uid, // Yeh ab Firebase UID hai
            role: userRole,
            ...userDoc // Firestore se mila poora data
        };
        next();
        
    } catch (err) {
        console.error("Firebase Token Error:", err.code, err.message);
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

// 2. Check karta hai ki user 'Candidate' hai
exports.isCandidate = (req, res, next) => {
    if (req.user.role !== 'candidate') {
        return res.status(403).json({ message: 'Access denied. Only for candidates.' });
    }
    next();
};

// 3. Check karta hai ki user 'Recruiter' hai
exports.isRecruiter = (req, res, next) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({ message: 'Access denied. Only for recruiters.' });
    }
    next();
};