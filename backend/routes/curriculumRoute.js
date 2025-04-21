const express=require('express');
const router=express.Router();
const {addCurriculum,getCurriculum}=require('../controllers/curriculumController');
const jwtMiddleware=require('../middleware/jwtMiddleware');
const { route } = require('./courseRoute');
router.post('/addCurriculum',jwtMiddleware,addCurriculum);
// router.get('/getCurriculum',jwtMiddleware,getCurriculum);
module.exports=router;