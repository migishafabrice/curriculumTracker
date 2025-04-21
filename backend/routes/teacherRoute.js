const express = require('express'); 
const { addTeacher, getTeachers } = require("../controllers/teacherController"); 
const jwtMiddleware = require('../middleware/jwtMiddleware'); 
const Router = express.Router(); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup file storage configuration
const uploadDir = path.join(__dirname, '../uploads/teachers');
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
Router.post('/addTeacher',jwtMiddleware, upload.single('photo'), addTeacher);
Router.get('/allTeachers/:id', jwtMiddleware, (req, res) => {
  const teacherId = req.params.id;
  getTeachers(req, res, teacherId);
});
Router.get('/allTeachers',jwtMiddleware,getTeachers);

module.exports = Router; // Export the router for use in other files
