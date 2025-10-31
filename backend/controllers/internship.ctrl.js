const fs = require('fs');
const path = require('path');

// Updated data paths
const internshipsPath = path.join(__dirname, '..', 'data', 'available_internships.json');
const recruitersPath = path.join(__dirname, '..', 'data', 'recruiters.json');

// Helper functions
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

// PUBLIC - Get all internships (SORTED BY updatedOn)
exports.getAllInternships = (req, res) => {
    try {
        let internships = readData(internshipsPath);
        // Sort by 'updatedOn' date, newest first
        internships.sort((a, b) => {
            const dateA = a.updatedOn ? new Date(a.updatedOn) : new Date(0);
            const dateB = b.updatedOn ? new Date(b.updatedOn) : new Date(0);
            return dateB - dateA; // Sort descending
        });
        res.status(200).json(internships);
    } catch (error) {
        console.error("Error fetching or sorting internships:", error);
        res.status(500).json({ message: "Server error fetching internships." });
    }
};

// PUBLIC - Get single internship by ID
exports.getInternshipById = (req, res) => {
    try {
        let internships = readData(internshipsPath);
        const internship = internships.find(i => i.id === parseInt(req.params.id, 10));
        if (!internship) {
            return res.status(404).json({ message: "Internship not found." });
        }
        res.status(200).json(internship);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching internship." });
    }
};

// ✅ YEH FUNCTION MISSING THA
// PROTECTED - RECRUITER - Get all postings (by Company Name)
exports.getMyPostings = (req, res) => {
    try {
        const recruiterId = req.user.id;
        let allInternships = readData(internshipsPath);
        let recruiters = readData(recruitersPath); 

        const recruiter = recruiters.find(r => r.id === recruiterId);
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter profile not found." });
        }
        const recruiterCompany = recruiter.company;

        // Filter by COMPANY NAME
        const myPostings = allInternships.filter(internship => internship.company === recruiterCompany);
        
        myPostings.sort((a, b) => {
             const dateA = a.updatedOn ? new Date(a.updatedOn) : new Date(0);
             const dateB = b.updatedOn ? new Date(b.updatedOn) : new Date(0);
             return dateB - dateA;
        });
        res.status(200).json(myPostings);
    } catch (error) {
        console.error("Error fetching my postings:", error);
        res.status(500).json({ message: "Server error fetching postings." });
    }
};

// ✅ YEH FUNCTION MISSING THA
// PROTECTED - RECRUITER - Post a new internship
exports.postInternship = (req, res) => {
    try {
        const recruiterId = req.user.id;
        let internships = readData(internshipsPath);
        let recruiters = readData(recruitersPath);
        const recruiter = recruiters.find(r => r.id === recruiterId);
        if (!recruiter) {
             return res.status(404).json({ message: "Recruiter profile not found." });
        }
        const maxId = internships.reduce((max, i) => i.id > max ? i.id : max, 0);
        const newId = maxId + 1;
        const newInternship = {
            id: newId,
            title: req.body.title || "Default Title",
            company: recruiter.company,
            location: req.body.location || "Default Location",
            logo: recruiter.companyLogo,
            postedOn: new Date().toISOString(), 
            updatedOn: new Date().toISOString(), 
            applicationDeadline: req.body.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            companyDescription: recruiter.description,
            responsibilities: req.body.responsibilities || [],
            requirements: req.body.requirements || [],
            skillsAndQualifications: req.body.skillsAndQualifications || [],
            duration: req.body.duration || "N/A",
            stipend: req.body.stipend || { min: 0, max: 0, currency: "₹", interval: "/Month" },
            workDetails: req.body.workDetails || { workingDays: "5 Days", schedule: "Flexible" },
            internshipType: req.body.internshipType || { type: "Hybrid", timing: "Part Time" },
            perks: req.body.perks || [],
            stats: { applied: 0, openings: req.body.openings || 1, impressions: 0 },
            eligibility: req.body.eligibility || ["Undergraduate", "Postgraduate"],
            recruiterId: recruiterId, // Store string ID
            status: "Active"
        };
        internships.unshift(newInternship);
        writeData(internshipsPath, internships);
        res.status(201).json({ message: "Internship posted successfully", internship: newInternship });
    } catch (error) {
        console.error("Post Internship Error:", error)
        res.status(500).json({ message: "Server error while posting internship." });
    }
};

// ✅ YEH FUNCTION MISSING THA
// PROTECTED - RECRUITER - Update an internship
exports.updateInternship = (req, res) => {
    try {
        const recruiterId = req.user.id;
        const internshipId = parseInt(req.params.id, 10);
        let internships = readData(internshipsPath);
        const index = internships.findIndex(i => i.id === internshipId);
        if (index === -1) { return res.status(404).json({ message: "Internship not found." }); }
        
        const recruiter = readData(recruitersPath).find(r => r.id === recruiterId);
        if (internships[index].recruiterId !== recruiterId && internships[index].company !== recruiter.company) { 
            return res.status(403).json({ message: "Not authorized." }); 
        }

        const updatedInternship = {
            ...internships[index], ...req.body,
            stipend: { ...internships[index].stipend, ...req.body.stipend },
            workDetails: { ...internships[index].workDetails, ...req.body.workDetails },
            internshipType: { ...internships[index].internshipType, ...req.body.internshipType },
            stats: { ...internships[index].stats, ...req.body.stats },
            updatedOn: new Date().toISOString(), 
            id: internshipId, 
            recruiterId: recruiterId
        };
        if (internships[index].postedOn) {
             updatedInternship.postedOn = internships[index].postedOn;
        }
        internships[index] = updatedInternship;
        writeData(internshipsPath, internships);
        res.status(200).json({ message: "Internship updated", internship: updatedInternship });
    } catch (error) {
         console.error("Update Internship Error:", error)
        res.status(500).json({ message: "Server error while updating." });
    }
};

// ✅ YEH FUNCTION MISSING THA
// PROTECTED - RECRUITER - Delete an internship
exports.deleteInternship = (req, res) => {
    try {
        const recruiterId = req.user.id;
        const internshipId = parseInt(req.params.id, 10);
        let internships = readData(internshipsPath);
        const index = internships.findIndex(i => i.id === internshipId);
        if (index === -1) { return res.status(404).json({ message: "Internship not found." }); }
        
        const recruiter = readData(recruitersPath).find(r => r.id === recruiterId);
         if (internships[index].recruiterId !== recruiterId && internships[index].company !== recruiter.company) { 
            return res.status(403).json({ message: "Not authorized." }); 
        }
        
        internships.splice(index, 1);
        writeData(internshipsPath, internships);
        res.status(200).json({ message: "Internship deleted." });
    } catch (error) {
         console.error("Delete Internship Error:", error)
        res.status(500).json({ message: "Server error while deleting." });
    }
};