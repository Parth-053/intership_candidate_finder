const { db } = require('../firebase-admin.js');
const { FieldValue } = require('firebase-admin/firestore');

class InternshipController {
  
  // PUBLIC - Get all internships
  async getAllInternships(req, res) {
    try {
        // ✅ FIX: Internships ko 'updatedOn' date ke hisaab se sort karein (latest pehle)
        const snapshot = await db.collection('internships')
                                 .where('status', '==', 'Active')
                                 .orderBy('updatedOn', 'desc') // <-- YEH NAYI LINE ADD KI GAYI HAI
                                 .get();
        
        const internships = [];
        snapshot.forEach(doc => {
            internships.push({ id: doc.id, ...doc.data() });
        });
        
        res.status(200).json(internships);
    } catch (error) {
        console.error("Error fetching internships:", error);
        res.status(500).json({ message: "Server error fetching internships." });
    }
  }

  // ... (Baaki saare functions waise hi rahenge) ...

  // PUBLIC - Get single internship by ID
  async getInternshipById(req, res) {
    try {
        const doc = await db.collection('internships').doc(String(req.params.id)).get(); // ID ko string mein badlein
        if (!doc.exists) {
            return res.status(404).json({ message: "Internship not found." });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ message: "Server error fetching internship." });
    }
  }

  // PROTECTED - RECRUITER - Get all postings (by Recruiter ID)
  async getMyPostings(req, res) {
    try {
        const recruiterId = req.user.id; 

        // ✅ FIX: Is page ko bhi 'updatedOn' se sort kar dein
        const snapshot = await db.collection('internships')
                                 .where('recruiterId', '==', recruiterId)
                                 .orderBy('updatedOn', 'desc') // <-- YEH NAYI LINE ADD KI GAYI HAI
                                 .get();

        const myPostings = [];
        snapshot.forEach(doc => {
            myPostings.push({ id: doc.id, ...doc.data() });
        });
        
        res.status(200).json(myPostings);
    } catch (error) {
        console.error("Error fetching my postings:", error);
        res.status(500).json({ message: "Server error fetching postings." });
    }
  }

  // PROTECTED - RECRUITER - Post a new internship
  async postInternship(req, res) {
    try {
        const recruiterId = req.user.id;
        const recruiter = req.user; 

        const newInternship = {
            ...req.body,
            company: recruiter.company,
            logo: recruiter.companyLogo,
            companyDescription: recruiter.description || "",
            recruiterId: recruiterId,
            status: "Active", // Default status
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedOn: new Date().toISOString(), 
            stats: { applied: 0, openings: req.body.openings || 1, impressions: 0 },
        };
        
        const docRef = await db.collection('internships').add(newInternship);
        
        const newId = docRef.id;
        await db.collection('internships').doc(newId).set({ ...newInternship, id: newId });

        res.status(201).json({ 
            message: "Internship posted successfully", 
            internship: { id: newId, ...newInternship } 
        });
    } catch (error) {
        console.error("Post Internship Error:", error)
        res.status(500).json({ message: "Server error while posting internship." });
    }
  }

  // PROTECTED - RECRUITER - Update an internship
  async updateInternship(req, res) {
    try {
        const internshipId = String(req.params.id); // ID ko string mein badlein
        const recruiterId = req.user.id;
        
        const updateData = {
            ...req.body,
            updatedAt: new Date().toISOString(),
            updatedOn: new Date().toISOString(), // updatedOn field bhi update karein
        };

        const docRef = db.collection('internships').doc(internshipId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Internship not found." });
        }
        
        if (doc.data().recruiterId !== recruiterId) {
             return res.status(403).json({ message: "Access denied. You can only edit your own postings." });
        }

        await docRef.update(updateData);
        
        res.status(200).json({ 
            message: "Internship updated successfully"
        });
    } catch (error) {
        console.error("Update Internship Error:", error)
        res.status(500).json({ message: "Server error while updating internship." });
    }
  }

  // PROTECTED - RECRUITTER - Delete an internship
  async deleteInternship(req, res) {
     try {
        const internshipId = String(req.params.id); // ID ko string mein badlein
        const recruiterId = req.user.id;

        const docRef = db.collection('internships').doc(internshipId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Internship not found." });
        }
        
        if (doc.data().recruiterId !== recruiterId) {
             return res.status(403).json({ message: "Access denied. You can only delete your own postings." });
        }

        await docRef.delete();
        
        res.status(200).json({ 
            message: "Internship deleted successfully"
        });
    } catch (error) {
        console.error("Delete Internship Error:", error)
        res.status(500).json({ message: "Server error while deleting internship." });
    }
  }
}

module.exports = new InternshipController();