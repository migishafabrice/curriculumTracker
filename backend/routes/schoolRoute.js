const express = require('express'); // Import Express
const { addSchool,getSchools } = require("../controllers/schoolController"); // Controller function
const jwtMiddleware = require('../middleware/jwtMiddleware');
const Router = express.Router(); // Create a new Router instance
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup file storage configuration
const uploadDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory and any necessary subdirectories
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in the 'uploads/logos' directory (absolute path)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original file extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Define the POST route for adding a school
Router.post('/addSchool', jwtMiddleware, upload.single('logo'), async (req, res, next) => {
  try {
    await addSchool(req, res);
  } catch (error) {
    if (error instanceof TypeError && req.file) {
      // Delete the uploaded logo if a TypeError occurs
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
    next(error); // Pass the error to the next middleware
  }
});
Router.get('/allSchools',getSchools);

module.exports = Router; // Export the router for use in other files
