const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File kahan save karni hai aur naam kaise dena hai
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'public/uploads/'; // Default
    
    if (file.fieldname === 'profilePic') {
      dest += 'profile_pics/';
    } else if (file.fieldname === 'resume') {
      dest += 'resumes/';
    }
    
    // Check karein ki directory exist karti hai ya nahi
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // File ka unique naam banayein (timestamp + original name)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File type filter (Optional, lekin recommended)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePic') {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only .png or .jpeg images are allowed for profile pic'), false);
    }
  } else if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .doc, or .docx resumes are allowed'), false);
    }
  } else {
    cb(null, false); // Doosri kisi file ko ignore karein
  }
};

// Multer middleware ko configure karein
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
}).fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

module.exports = upload;