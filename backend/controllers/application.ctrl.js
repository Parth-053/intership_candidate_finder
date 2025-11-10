const { db } = require('../firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

class ApplicationController {

  /**
   * @desc    Candidate applies for an internship
   * @route   POST /api/candidate/apply
   */
  async applyForInternship(req, res) {
    try {
      const candidateId = req.user.id; // Firebase UID
      const { internshipId } = req.body; // Document ID of the internship

      if (!internshipId) {
        return res.status(400).json({ message: 'Internship ID is required.' });
      }

      const internshipRef = db.collection('internships').doc(String(internshipId));
      const internshipDoc = await internshipRef.get();

      if (!internshipDoc.exists) {
        return res.status(404).json({ message: 'Internship not found.' });
      }

      const recruiterId = internshipDoc.data().recruiterId;

      // Check for existing application
      const appQuery = await db.collection('applications')
        .where('candidateId', '==', candidateId)
        .where('internshipId', '==', internshipId)
        .limit(1)
        .get();

      if (!appQuery.empty) {
        return res.status(400).json({ message: 'You have already applied for this internship.' });
      }

      const newApplication = {
        candidateId,
        internshipId: String(internshipId), // ID ko string ki tarah save karein
        recruiterId: recruiterId,
        status: 'Applied',
        appliedOn: new Date().toISOString(),
      };

      // Save new application
      const appRef = await db.collection('applications').add(newApplication);

      // Increment applied count on internship
      await internshipRef.update({
        'stats.applied': FieldValue.increment(1)
      });

      res.status(201).json({ 
          message: 'Application submitted successfully!', 
          application: { id: appRef.id, ...newApplication } 
      });
    } catch (error) {
      console.error('Apply Error:', error);
      res.status(500).json({ message: 'Server error while applying.' });
    }
  }

  /**
   * @desc    Recruiter gets all applicants for a specific job
   * @route   GET /api/recruiter/applicants/:internshipId
   */
  async getApplicantsForJob(req, res) {
    try {
      const { internshipId } = req.params;
      const recruiterId = req.user.id;

      // Hum sorting (orderBy) ko hata rahe hain taaki index ki zaroorat na pade
      const appQuery = await db.collection('applications')
        .where('internshipId', '==', String(internshipId)) // ID ko string se compare karein
        .where('recruiterId', '==', recruiterId)
        .get();

      if (appQuery.empty) {
          return res.status(200).json([]);
      }

      const applicantsPromises = [];
      appQuery.forEach(doc => {
          const appData = doc.data();
          const candidatePromise = db.collection('candidates').doc(appData.candidateId).get();
          applicantsPromises.push({ app: { id: doc.id, ...appData }, candidatePromise });
      });

      const applicants = [];
      for (const item of applicantsPromises) {
          const candidateDoc = await item.candidatePromise;
          if (candidateDoc.exists) {
              applicants.push({
                  ...item.app,
                  candidateDetails: candidateDoc.data()
              });
          }
      }

      res.status(200).json(applicants);
    } catch (error) {
      console.error('Get Applicants Error:', error);
      res.status(500).json({ message: 'Server error fetching applicants.' });
    }
  }

  /**
   * @desc    Recruiter updates an application's status
   * @route   PATCH /api/recruiter/applications/:applicationId/status
   */
  async updateApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params; // This is the Document ID of the application
      const { status } = req.body;
      const recruiterId = req.user.id;

      if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
      }

      const appRef = db.collection('applications').doc(applicationId);
      const appDoc = await appRef.get();

      if (!appDoc.exists) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      if (appDoc.data().recruiterId !== recruiterId) {
        return res.status(403).json({ message: 'You are not authorized to update this application.' });
      }

      await appRef.update({ status: status });
      
      res.status(200).json({ message: `Application status updated to ${status}` });
    } catch (error) {
      console.error('Update Status Error:', error);
      res.status(500).json({ message: 'Server error updating status.' });
    }
  }
}

module.exports = new ApplicationController();