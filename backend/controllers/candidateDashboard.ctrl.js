const { db } = require('../firebase-admin');

class CandidateDashboardController {

  /**
   * @desc    Get all applications for the logged-in candidate
   * @route   GET /api/candidate/my-applications
   */
  async getMyApplications(req, res) {
    try {
      const candidateId = req.user.id;
      
      const appQuery = await db.collection('applications')
                               .where('candidateId', '==', candidateId)
                               .orderBy('appliedOn', 'desc')
                               .get();

      if (appQuery.empty) {
        return res.status(200).json([]);
      }

      const applications = [];
      const internshipPromises = [];

      appQuery.forEach(doc => {
        const appData = doc.data();
        applications.push({ id: doc.id, ...appData });
        internshipPromises.push(db.collection('internships').doc(String(appData.internshipId)).get());
      });

      const internshipDocs = await Promise.all(internshipPromises);

      const myApplications = applications.map((app, index) => {
        const internshipDoc = internshipDocs[index];
        const internship = internshipDoc.exists ? internshipDoc.data() : null;
        
        return {
          ...app,
          internshipTitle: internship ? internship.title : 'Internship No Longer Available',
          companyName: internship ? internship.company : 'N/A',
          location: internship ? internship.location : 'N/A',
          stipend: internship ? internship.stipend : null,
          logo: internship ? internship.logo : null
        };
      });

      res.status(200).json(myApplications);
    } catch (error) {
      console.error('Get My Applications Error:', error);
      res.status(500).json({ message: 'Server error fetching applications.' });
    }
  }

  /**
   * @desc    Get all saved internships for the logged-in candidate
   * @route   GET /api/candidate/saved-internships
   */
  async getMySavedInternships(req, res) {
    try {
      const candidateId = req.user.id;
      const userDoc = await db.collection('candidates').doc(candidateId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }

      const savedIds = (userDoc.data().savedInternships || []).map(String); // Ensure IDs are strings
      if (savedIds.length === 0) {
          return res.status(200).json([]);
      }
      
      const savedJobs = [];
      for (const id of savedIds) {
          const doc = await db.collection('internships').doc(id).get();
          if (doc.exists) {
              savedJobs.push({ id: doc.id, ...doc.data() });
          }
      }
      
      res.status(200).json(savedJobs);
    } catch (error) {
      console.error('Get Saved Internships Error:', error);
      res.status(500).json({ message: 'Server error fetching saved internships.' });
    }
  }

  /**
   * @desc    Get notifications (REAL DATA)
   * @route   GET /api/candidate/notifications
   */
  async getMyNotifications(req, res) {
    try {
        const candidateId = req.user.id;
        
        const appQuery = await db.collection('applications')
                                 .where('candidateId', '==', candidateId)
                                 .orderBy('appliedOn', 'desc')
                                 .limit(20) 
                                 .get();
        
        if (appQuery.empty) {
            return res.status(200).json([]);
        }

        const notifications = [];
        const internshipPromises = {};

        appQuery.forEach(doc => {
            const app = doc.data();
            
            if (app.status !== 'Applied') { 
                notifications.push({
                    id: doc.id, // Application ID
                    status: app.status,
                    date: app.appliedOn, 
                    internshipId: app.internshipId,
                    isRead: app.isRead || false // ✅ 'isRead' status ko fetch karein
                });
                if (!internshipPromises[app.internshipId]) {
                    internshipPromises[app.internshipId] = db.collection('internships').doc(String(app.internshipId)).get();
                }
            }
        });

        if (notifications.length === 0) {
             return res.status(200).json([]);
        }

        const internshipDocs = await Promise.all(Object.values(internshipPromises));
        const internshipMap = new Map();
        internshipDocs.forEach(doc => {
            if(doc.exists) {
                internshipMap.set(doc.id, doc.data().title);
            }
        });

        const finalNotifications = notifications.map(notif => {
            const title = internshipMap.get(String(notif.internshipId)) || "an internship";
            return {
                id: notif.id,
                message: `Your application for '${title}' was ${notif.status}.`,
                read: notif.isRead, // ✅ Hardcoded 'false' ki jagah real value use karein
                date: notif.date
            };
        });
        
        res.status(200).json(finalNotifications);

    } catch(error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: 'Server error fetching notifications.' });
    }
  }

  /**
   * @desc    Mark a notification as read
   * @route   PATCH /api/candidate/notifications/:id/read
   * @access  Private (Candidate)
   */
  async markNotificationAsRead(req, res) {
    try {
      const candidateId = req.user.id;
      const applicationId = req.params.id; // Yeh notification ki ID hai (jo application ID hai)

      const appRef = db.collection('applications').doc(applicationId);
      const appDoc = await appRef.get();

      if (!appDoc.exists) {
        return res.status(404).json({ message: 'Notification (Application) not found.' });
      }

      // Security check: Kya yeh notification isi candidate ki hai?
      if (appDoc.data().candidateId !== candidateId) {
        return res.status(403).json({ message: 'You are not authorized to update this notification.' });
      }

      // Status ko update karein
      await appRef.update({ isRead: true });
      
      res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
      console.error('Mark as Read Error:', error);
      res.status(500).json({ message: 'Server error marking notification as read.' });
    }
  }
}

module.exports = new CandidateDashboardController();