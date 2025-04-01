const express = require('express');
const router = express.Router();

// Controller functions (you need to implement these in a separate file)
const {
    addEducationType,
    addLevelType,
    getEducationTypes,
    getLevelTypes,
    addSectionType,
    getSectionTypes
    
} = require('../controllers/departmentController');
router.post('/education-type', addEducationType);
router.get('/education-types', getEducationTypes);
router.post('/level-type', addLevelType);
router.get('/level-types', getLevelTypes);
router.post('/section-type', addSectionType);
router.get('/section-types', getSectionTypes);

module.exports = router;