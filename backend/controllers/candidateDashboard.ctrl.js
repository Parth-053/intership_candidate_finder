const fs = require('fs');
const path = require('path');

// Updated paths
const applicationsPath = path.join(__dirname, '..', 'data', 'applications.json');
const internshipsPath = path.join(__dirname, '..', 'data', 'available_internships.json');
const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json'); // Need candidate's saved list

// Helper functions (same as auth.ctrl.js)
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { console.error(`Read Error ${filePath}:`, error); return []; }
};

// PROTECTED - CANDIDATE - Get applications submitted by the candidate
exports.getMyApplications = (req, res) => {
    try {
        const candidateId = req.user.id; 
        let applications = readData(applicationsPath);
        let internships = readData(internshipsPath);
        
        const myApplications = applications
            .filter(app => app.candidateId === candidateId)
            .map(app => {
                const internship = internships.find(i => i.id === app.internshipId);
                return {
                    ...app,
                    // Include relevant internship details
                    internshipTitle: internship ? internship.title : 'Internship No Longer Available',
                    companyName: internship ? internship.company : 'N/A', // Use 'company' field from internships
                    location: internship ? internship.location : 'N/A',
                    stipend: internship ? internship.stipend : null,
                    logo: internship ? internship.logo : null
                };
            })
            .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)); // Sort by most recent first
        
        res.status(200).json(myApplications);
    } catch (error) {
        console.error("Get My Applications Error:", error);
        res.status(500).json({ message: "Server error fetching applications." });
    }
};

// PROTECTED - CANDIDATE - Get internships saved by the candidate
exports.getMySavedInternships = (req, res) => {
    try {
        const candidateId = req.user.id;
        let candidates = readData(candidatesPath);
        let internships = readData(internshipsPath);

        const user = candidates.find(u => u.id === candidateId);
        
        if (!user || !Array.isArray(user.savedInternships) || user.savedInternships.length === 0) {
            return res.status(200).json([]); // Return empty if no user or no saved internships
        }

        // Filter the main internships list based on saved IDs
        const savedJobs = internships.filter(i => user.savedInternships.includes(i.id));
        
        res.status(200).json(savedJobs);
    } catch (error) {
        console.error("Get Saved Internships Error:", error);
        res.status(500).json({ message: "Server error fetching saved internships." });
    }
};

// PROTECTED - CANDIDATE - Get notifications (dummy for now)
exports.getMyNotifications = (req, res) => {
    // Replace with real notification logic later
    const dummyNotifications = [
        { id: `notif_${Date.now()}_1`, message: "Your application for 'Web Development Intern' at Google was shortlisted!", read: false, date: new Date(Date.now() - 1*24*60*60*1000).toISOString() }, // 1 day ago
        { id: `notif_${Date.now()}_2`, message: "Recruiter from Microsoft viewed your profile.", read: true, date: new Date(Date.now() - 3*24*60*60*1000).toISOString() }, // 3 days ago
        { id: `notif_${Date.now()}_3`, message: "Welcome! Complete your profile to increase your chances.", read: true, date: new Date(Date.now() - 7*24*60*60*1000).toISOString() }, // 7 days ago
    ];
    res.status(200).json(dummyNotifications);
};