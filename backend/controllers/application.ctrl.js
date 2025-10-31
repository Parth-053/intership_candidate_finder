const fs = require('fs');
const path = require('path');

// Updated Paths
const applicationsPath = path.join(__dirname, '..', 'data', 'applications.json');
const internshipsPath = path.join(__dirname, '..', 'data', 'available_internships.json');
const candidatesPath = path.join(__dirname, '..', 'data', 'candidates.json'); // For applicant details

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

// PROTECTED - CANDIDATE - Apply for an internship
exports.applyForInternship = (req, res) => {
    try {
        const candidateId = req.user.id;
        const internshipId = parseInt(req.body.internshipId, 10); // Ensure ID is number

        if (isNaN(internshipId)) {
             return res.status(400).json({ message: "Invalid Internship ID." });
        }

        let applications = readData(applicationsPath);
        let internships = readData(internshipsPath);
        
        const internship = internships.find(intern => intern.id === internshipId);
        if (!internship) {
            return res.status(404).json({ message: "Internship not found." });
        }

        const existingApplication = applications.find(app => app.candidateId === candidateId && app.internshipId === internshipId);
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this internship." });
        }

        const newApplication = {
            id: `app_${new Date().getTime()}`,
            candidateId,
            internshipId,
            recruiterId: internship.recruiterId, // Make sure internships have recruiterId
            status: 'Applied', 
            appliedOn: new Date().toISOString()
        };
        
        applications.unshift(newApplication);
        writeData(applicationsPath, applications);
        
        // Optional: Update internship applied count
        const internIndex = internships.findIndex(i => i.id === internshipId);
        if (internIndex !== -1) {
            internships[internIndex].stats.applied = (internships[internIndex].stats.applied || 0) + 1;
            writeData(internshipsPath, internships);
        }
        
        res.status(201).json({ message: "Application submitted successfully!", application: newApplication });

    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ message: "Server error while applying." });
    }
};

// PROTECTED - RECRUITER - Get applicants for a specific job
exports.getApplicantsForJob = (req, res) => {
    try {
        const internshipId = parseInt(req.params.internshipId, 10);
        const recruiterId = req.user.id;

        if (isNaN(internshipId)) {
             return res.status(400).json({ message: "Invalid Internship ID." });
        }

        let applications = readData(applicationsPath);
        let candidates = readData(candidatesPath); // Read candidates data
        
        const jobApplicants = applications
            .filter(app => app.internshipId === internshipId && app.recruiterId === recruiterId)
            .map(app => {
                const candidate = candidates.find(c => c.id === app.candidateId);
                // Exclude sensitive candidate info like password
                const { password, savedInternships, ...candidateInfo } = candidate || {}; 
                return {
                    ...app,
                    candidateDetails: candidate ? candidateInfo : { name: 'Unknown', email: 'Unknown' }
                };
            });
        
        res.status(200).json(jobApplicants);

    } catch (error) {
        console.error("Get Applicants Error:", error);
        res.status(500).json({ message: "Server error fetching applicants." });
    }
};

// PROTECTED - RECRUITER - Update application status
exports.updateApplicationStatus = (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body; // e.g., "Shortlisted", "Rejected"
        const recruiterId = req.user.id;

        if (!status) {
             return res.status(400).json({ message: "Status is required." });
        }

        let applications = readData(applicationsPath);
        const appIndex = applications.findIndex(app => app.id === applicationId);
        
        if (appIndex === -1) {
            return res.status(404).json({ message: "Application not found." });
        }
        
        // Verify recruiter owns this application (via recruiterId stored in application)
        if (applications[appIndex].recruiterId !== recruiterId) {
            return res.status(403).json({ message: "You are not authorized to update this application." });
        }

        applications[appIndex].status = status;
        writeData(applicationsPath, applications);
        
        // TODO: Add notification logic here later
        
        res.status(200).json({ message: `Application status updated to ${status}`, application: applications[appIndex] });

    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Server error updating status." });
    }
};