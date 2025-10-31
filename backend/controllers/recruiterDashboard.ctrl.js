const fs = require('fs');
const path = require('path');

// Updated Paths
const applicationsPath = path.join(__dirname, '..', 'data', 'applications.json');
const internshipsPath = path.join(__dirname, '..', 'data', 'available_internships.json');
const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json');
const recruitersPath = path.join(__dirname, '..', 'data', 'recruiters.json'); // ✅ Add recruiters path

// Helper functions (same as auth.ctrl.js)
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) { console.error(`Read Error ${filePath}:`, error); return []; }
};

// PROTECTED - RECRUITER - Get dashboard statistics
exports.getDashboardStats = (req, res) => {
    try {
        const recruiterId = req.user.id; // e.g., "recruiter_1729997400001"
        
        let applications = readData(applicationsPath);
        let internships = readData(internshipsPath);
        let recruiters = readData(recruitersPath); // ✅ Read recruiters

        // Find recruiter's company
        const recruiter = recruiters.find(r => r.id === recruiterId);
        if (!recruiter) { return res.status(404).json({ message: "Recruiter not found" }); }
        const recruiterCompany = recruiter.company; // e.g., "Google"

        // ✅ Filter internships by COMPANY NAME
        const myJobs = internships.filter(job => job.company === recruiterCompany);
        const myJobIds = myJobs.map(job => job.id); // Get IDs from these jobs
        
        // Filter applications received for those internships
        const myApplications = applications.filter(app => myJobIds.includes(app.internshipId));
        
        const totalPostedJobs = myJobs.length;
        const totalApplicants = myApplications.length;
        const totalShortlisted = myApplications.filter(app => app.status === 'Shortlisted').length;
        
        // ✅ "newApplicants" logic (e.g., in last 24 hours)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const newApplicantsCount = myApplications.filter(app => new Date(app.appliedOn) > oneDayAgo).length;

        res.status(200).json({
            totalPostedJobs,
            totalApplicants,
            totalShortlisted,
            newApplicants: newApplicantsCount // ✅ Send new count
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error fetching stats." });
    }
};

// PROTECTED - RECRUITER - Get recent applicants (e.g., last 5)
exports.getRecentApplicants = (req, res) => {
    try {
        const recruiterId = req.user.id;
        let applications = readData(applicationsPath);
        let candidates = readData(candidatesPath);
        let internships = readData(internshipsPath);
        let recruiters = readData(recruitersPath); // ✅ Read recruiters

        // Find recruiter's company
        const recruiter = recruiters.find(r => r.id === recruiterId);
        if (!recruiter) { return res.status(404).json({ message: "Recruiter not found" }); }
        const recruiterCompany = recruiter.company; // e.g., "Google"

        // ✅ Get Job IDs for the recruiter's company
        const myJobIds = internships.filter(job => job.company === recruiterCompany).map(job => job.id);

        const recentApplications = applications
            // ✅ Filter applications for this recruiter's jobs (using job IDs)
            .filter(app => myJobIds.includes(app.internshipId)) 
            .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)) // Sort by most recent
            .slice(0, 5) // Get top 5
            .map(app => {
                const candidate = candidates.find(c => c.id === app.candidateId);
                const internship = internships.find(i => i.id === app.internshipId);
                const { password, savedInternships, ...candidateInfo } = candidate || {}; 
                return {
                    ...app,
                    candidateDetails: candidate ? candidateInfo : { name: 'N/A', email: 'N/A' },
                    internshipTitle: internship ? internship.title : 'N/A'
                };
            });
            
        res.status(200).json(recentApplications);
    } catch (error) {
        console.error("Get Recent Applicants Error:", error);
        res.status(500).json({ message: "Server error fetching recent applicants." });
    }
};