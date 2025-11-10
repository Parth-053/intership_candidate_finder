const { db } = require('../firebase-admin');

class RecruiterDashboardController {

  /**
   * @desc    Get dashboard statistics for the logged-in recruiter
   * @route   GET /api/recruiter/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      const recruiterId = req.user.id;
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Recruiter ki saari jobs fetch karein
      const jobsQuery = await db.collection('internships')
                                .where('recruiterId', '==', recruiterId)
                                .get();
      
      const totalPostedJobs = jobsQuery.size;
      
      if (totalPostedJobs === 0) {
          return res.status(200).json({
              totalPostedJobs: 0, totalApplicants: 0,
              totalShortlisted: 0, newApplicants: 0
          });
      }

      // Saari applications fetch karein jo is recruiter ke liye hain
      const appsQuery = await db.collection('applications')
                                .where('recruiterId', '==', recruiterId)
                                .get();

      let totalApplicants = 0;
      let totalShortlisted = 0;
      let newApplicantsCount = 0;

      appsQuery.forEach(doc => {
          const app = doc.data();
          totalApplicants++;
          if (app.status === 'Shortlisted') {
              totalShortlisted++;
          }
          if (app.appliedOn >= twentyFourHoursAgo) {
              newApplicantsCount++;
          }
      });

      res.status(200).json({
        totalPostedJobs,
        totalApplicants,
        totalShortlisted,
        newApplicants: newApplicantsCount
      });
    } catch (error) {
      console.error('Get Dashboard Stats Error:', error);
      res.status(500).json({ message: 'Server error fetching stats.' });
    }
  }

  /**
   * @desc    Get recent applicants for the logged-in recruiter
   * @route   GET /api/recruiter/dashboard/recent-applicants
   */
  async getRecentApplicants(req, res) {
    try {
      const recruiterId = req.user.id;

      // Hum sorting (orderBy) ko hata rahe hain taaki index ki zaroorat na pade
      const recentAppsQuery = await db.collection('applications')
        .where('recruiterId', '==', recruiterId)
        .limit(5) // Hum abhi bhi 5 hi lenge
        .get();
        
      if (recentAppsQuery.empty) {
          return res.status(200).json([]);
      }
        
      const promises = [];

      recentAppsQuery.forEach(doc => {
          const appData = doc.data();
          const candidatePromise = db.collection('candidates').doc(appData.candidateId).get();
          // internshipId ko String() mein badalna zaroori hai
          const internshipPromise = db.collection('internships').doc(String(appData.internshipId)).get();
          
          promises.push(async () => {
             const [candidateDoc, internshipDoc] = await Promise.all([candidatePromise, internshipPromise]);
             return {
                id: doc.id, // Application ki document ID
                ...appData,
                candidateDetails: candidateDoc.exists ? candidateDoc.data() : { name: "Unknown" },
                internshipTitle: internshipDoc.exists ? internshipDoc.data().title : "N/A"
             };
          });
      });
      
      const results = await Promise.all(promises.map(p => p()));
            
      res.status(200).json(results);
    } catch (error) {
      console.error('Get Recent Applicants Error:', error);
      res.status(500).json({ message: 'Server error fetching recent applicants.' });
    }
  }
}

module.exports = new RecruiterDashboardController();