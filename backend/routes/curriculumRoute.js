const express=require('express');
const router=express.Router();
const {addCurriculum}=require('../controllers/curriculumController');
router.post('/addCurriculum',addCurriculum);
module.exports=router;