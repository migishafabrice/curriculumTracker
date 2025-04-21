const express=require('express');
const router=express.Router();
const jwtMiddleware=require('../middleware/jwtMiddleware');
const {addCourse, getCourses, getCourseById, updateCourse, deleteCourse}=require('../controllers/courseController');
router.post('/add',jwtMiddleware,addCourse);
// router.get('/',jwtMiddleware,getCourses);
module.exports=router;