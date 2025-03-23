const express = require('express');
const router = express.Router();

// Controller functions (you need to implement these in a separate file)
const {
    addEducationType
    
} = require('../controllers/departmentController');

// Route to add a new education type
router.post('/education-type', addEducationType);

// Route to add a new education level
// router.post('/education-level', addEducationLevel);

// // Route to add a new education section
// router.post('/education-section', addEducationSection);

module.exports = router;