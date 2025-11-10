require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./firebase-admin'); 
console.log('>>> Firebase Admin SDK Initialized');

// Routes ko import karna
const authRoutes = require('./routes/authRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const profileRoutes = require('./routes/profileRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const dataRoutes = require('./routes/dataRoutes');

// Express app
const app = express();

// Middleware
app.use(cors()); // CORS ko enable karna
app.use(express.json()); // Request body se JSON parse karna
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (jaise company logos)
app.use(express.static(path.join(__dirname, 'public')));
console.log('>>> server.js: Serving static files from /public directory');

// API Endpoints ko register karna
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/data', dataRoutes);

// Basic server test route
app.get('/', (req, res) => {
    res.send('Backend server is active and running!');
});

// Server ko start karna
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});