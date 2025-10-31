const jwt = require('jsonwebtoken');

// 1. Check karta hai ki user logged-in hai ya nahi
exports.isAuthenticated = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    
    const token = authHeader.split(' ')[1]; // Format: 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'Token format incorrect, authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // { id: '...', role: '...' }
        next();
    } catch (err) {
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