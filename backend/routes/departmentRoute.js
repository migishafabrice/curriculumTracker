const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
// Controller functions (you need to implement these in a separate file)
const {
    addEducationType,
    addLevelType,
    getEducationTypes,
    getLevelTypes,
    addSectionType,
    getSectionTypes
    
} = require('../controllers/departmentController');
router.post('/education-type',jwtMiddleware, addEducationType);
router.post('/education-types', jwtMiddleware, async (req, res) => {
    try {
    const { school_code } = req.body;
    const result = await getEducationTypes({ school_code });
    if (result.type === 'error') {
        return res.status(400).json({ error: result.message });
    }
   return res.json(result);
    } catch (error) {
      return   res.json({ error: error.message });
    }
});
router.post('/level-type',jwtMiddleware, addLevelType);
router.post('/level-types', jwtMiddleware, async (req, res) => {
    try {
        const { education_type_code, school_code } = req.body;
        const result = await getLevelTypes({ education_type_code, school_code });
        if (result.type === 'error') {
            return res.status(400).json({ message: result.message, type:"error" });
        }
       return res.json(result);
    } catch (error) {
       return res.json({ message: error.message, type:"error" });
    }
});
router.post('/section-type',jwtMiddleware, addSectionType);
router.get('/section-types',jwtMiddleware, getSectionTypes);

module.exports = router;