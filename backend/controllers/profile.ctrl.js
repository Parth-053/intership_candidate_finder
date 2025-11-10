const { db } = require('../firebase-admin');

class ProfileController {

  /**
   * @desc    Get the logged-in user's profile
   * @route   GET /api/profile/me
   */
  async getMyProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json(req.user);
    } catch (error) {
      console.error('Get Profile Error:', error);
      res.status(500).json({ message: 'Server error fetching profile.' });
    }
  }

  /**
   * @desc    Update the logged-in user's profile
   * @route   PUT /api/profile/me
   */
  async updateMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const collectionName = userRole === 'candidate' ? 'candidates' : 'recruiters';

      // Fields jo update nahi hone chahiye
      const { id, _id, role, email, password, createdAt, uid, ...updateData } = req.body;
      
      const finalUpdateData = {
          ...updateData,
          updatedAt: new Date().toISOString() // Update timestamp
      };

      // ✅ Check karein agar file upload hui hai
      if (req.files) {
        if (req.files.profilePic && req.files.profilePic[0]) {
          // File path ko public URL format mein save karein
          const profilePicPath = '/' + req.files.profilePic[0].path.replace(/\\/g, '/').replace('public/', '');
          finalUpdateData.profilePic = profilePicPath;
        }
        
        if (req.files.resume && req.files.resume[0]) {
          // File path ko public URL format mein save karein
          const resumePath = '/' + req.files.resume[0].path.replace(/\\/g, '/').replace('public/', '');
          // Resume 'profile' object ke andar nested hai
          finalUpdateData.profile = {
              ...req.user.profile, // Purana profile data
              resumeUrl: resumePath // Naya path
          };
        }
      }

      const userRef = db.collection(collectionName).doc(userId);
      // ✅ Update ki jagah 'merge: true' ke saath 'set' ka istemaal karein
      // Yeh nested objects (jaise 'profile.resumeUrl') ko update karne mein mad
      await userRef.set(finalUpdateData, { merge: true });

      const updatedDoc = await userRef.get();

      res.status(200).json({ 
          message: 'Profile updated successfully.', 
          user: updatedDoc.data() 
      });
    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({ message: 'Server error updating profile.' });
    }
  }

  // ... saveInternshipToggle function waisa hi rahega ...
  async saveInternshipToggle(req, res) {
    try {
      const candidateId = req.user.id;
      const { internshipId } = req.params;
      
      // ✅ internshipId ko number se string mein convert karna
      const internIdString = String(internshipId);

      const userRef = db.collection('candidates').doc(candidateId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: 'Candidate not found.' });
      }
      
      const internshipRef = db.collection('internships').doc(internIdString);
      const internshipDoc = await internshipRef.get();
      if (!internshipDoc.exists) {
        return res.status(404).json({ message: 'Internship not found.' });
      }
      
      // savedInternships ab string IDs store karega
      const savedInternships = (userDoc.data().savedInternships || []).map(String);
      let newSavedList = [];
      let message = '';

      if (savedInternships.includes(internIdString)) {
        // Unsave
        newSavedList = savedInternships.filter(id => id !== internIdString);
        message = 'Internship removed from saved list.';
      } else {
        // Save
        newSavedList = [...savedInternships, internIdString];
        message = 'Internship saved successfully.';
      }
      
      await userRef.update({ savedInternships: newSavedList });
      
      res.status(200).json({ message, savedInternships: newSavedList });
    } catch (error) {
      console.error('Save Toggle Error:', error);
      res.status(500).json({ message: 'Server error saving internship.' });
    }
  }
}

module.exports = new ProfileController();