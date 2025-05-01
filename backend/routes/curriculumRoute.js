const express=require('express');
const router=express.Router();
const {addCurriculum,getCurriculumTypes,assignCurriculum}=require('../controllers/curriculumController');
const jwtMiddleware=require('../middleware/jwtMiddleware');
router.post('/addCurriculum',jwtMiddleware,addCurriculum);
router.post('/curriculum-types',jwtMiddleware,async (req, res) => {
    try {
        const { education_type_code, level_type_code, section_type_code, class_type_code } = req.body;
        const result = await getCurriculumTypes({ education_type_code, level_type_code, section_type_code, class_type_code });
        if (result.type === 'error') {
            return res.status(400).json({ message: result.message, type:"error" });
        }
       return res.json(result);
    } catch (error) {
       return res.json({ message: error.message, type:"error" });
    }
}
);
router.post('/assignCurriculum',jwtMiddleware,async (req, res) => {
    try {
        const { teacherCode,courses,school } = req.body;
        const result = await assignCurriculum({ teacherCode,courses,school});
        if (result.type === 'error') {
            return res.status(400).json({ message: result.message, type:"error" });
        }
       return res.json({message:result.message, type:result.type});
    } catch (error) {
       return res.json({ message: error.message, type:"error" });
    }
}
);

// router.get('/getCurriculum',jwtMiddleware,getCurriculum);
module.exports=router;