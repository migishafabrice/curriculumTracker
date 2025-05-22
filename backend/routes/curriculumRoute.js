const express=require('express');
const router=express.Router();
const {addCurriculum,getCurriculumTypes,assignCurriculum,
    getCurriculumPerTeachers, getCurriculumSelected, getCurriculaList}=require('../controllers/curriculumController');
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
router.post('/curriculum-per-teacher',jwtMiddleware,async (req, res) => {
    try {
        const { id,role } = req.body;
        
        const result = await getCurriculumPerTeachers({id,role});
        if (result.type === 'error') {
            return res.json({ message: result.message, type:"error" });
        }
        
       return res.json(result);
    } catch (error) {
       return res.json({ message: error.message, type:"error" });
    }
}
);
router.post('/course-selected',jwtMiddleware,async (req, res) => {
    try {
        const { course } = req.body;
        
        const result = await getCurriculumSelected({course});
        if (result.type === 'error') {
            return res.json({ message: result.message, type:"error" });
        }
        
       return res.json(result);
    } catch (error) {
       return res.json({ message: error.message, type:"error" });
    }
}
);
router.post('/getCoursesAssigned',jwtMiddleware,async (req, res) => {
    try {
        const { id,role } = req.body;
        
        const result = await getCurriculumPerTeachers({id,role});
        if (result.type === 'error') {
            return res.json({ message: result.message, type:"error" });
        }
        
       return res.json(result);
    } catch (error) {
       return res.json({ message: error.message, type:"error" });
    }
}
);
router.post('/curricula-list', async (req, res) => {
  try {
    const { id,role } = req.body;
    const curriculum = await getCurriculaList({ id, role });
    if (curriculum.type === 'error') {
      return res.status(400).json(curriculum);
    }
    return res.json(curriculum);
  } catch (error) {
    console.error('Error fetching curriculum list:', error);
    return res.status(500).json({ message: 'Server error', type: 'error' });
  }
});
// router.get('/getCurriculum',jwtMiddleware,getCurriculum);
module.exports=router;