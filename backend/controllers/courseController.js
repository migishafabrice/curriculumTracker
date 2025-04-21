const {db}=require('../config/config');
require('dotenv').config();
const addCourse=async(req,res)=>{
    try{
    if(!req.user)
    {
        return res.status(401).json({message:'Unauthorized'});
    }
const {courseName,courseSchool,courseTeacher}=req.body;
const [lastId]= await db.query('select id from courses order by id desc limit 1');
if(lastId.length==0)
{
    lastId[0].id=1;
}
else
{
    lastId[0].id=lastId[0].id+1;
}
const courseId=lastId[0].id+'CRS'+Date.now().toString().slice(-4);
const [result]=await db.query('insert into courses (courseId,courseName,courseSchool,courseTeacher) values (?,?,?,?)',[courseId,courseName,courseSchool,courseTeacher]);
if(result.affectedRows>0)
{
    return res.status(200).json({message:'Course added successfully'});
}   
else
{
    return res.status(500).json({message:'Error adding course'});
}
}
catch(err)
{
    console.error(err);
    return res.status(500).json({message:'Internal server error'});
}
}
module.exports={addCourse};
const getCourses=async(req,res)=>{
    try{
        if(!req.user)
        {
            return res.status(401).json({message:'Unauthorized'});
        }
        const [courses]=await db.query('select * from courses');
        return res.status(200).json(courses);
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({message:'Internal server error'});
    }
}
