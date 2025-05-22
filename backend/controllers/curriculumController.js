const axios = require('axios');
const multer = require('multer');
const { db } = require('../config/config');
const path = require('path');
const fs = require('fs');
const { type } = require('os');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../data/temp_uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('document');

const addCurriculum = async (req, res) => {
  try {
    // First handle the file upload (temporarily for both cases)
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ message: 'File upload error', error: err.message });
      } else if (err) {
        return res.status(500).json({ message: 'Unknown error during file upload', error: err.message });
      }

      try {
        const { name, education_type, level_type, section_type, class_type,
               description, duration,code,issued_on, inputMethod, structure } = req.body;

        if (!req.file) {
          return res.status(400).json({ message: 'Curriculum file is required', type: 'error' });
        }

        if (inputMethod === "Manual") {
          // Handle Manual case - save file permanently
          const finalUploadDir = path.join(__dirname, '../../data/uploads');
          if (!fs.existsSync(finalUploadDir)) {
            fs.mkdirSync(finalUploadDir, { recursive: true });
          }

          const finalFilename = code+"_" + Date.now() + path.extname(req.file.originalname);
          const finalPath = path.join(finalUploadDir, finalFilename);

          // Move file from temp location to permanent location
          fs.renameSync(req.file.path, finalPath);

          // Generate a unique code
          const codeNew = code+"_" + Date.now();
            const issued_on = new Date(Date.parse(issued_on)).toISOString();

          const query = `INSERT INTO curricula (code, name, duration, education_type_code, 
                        level_type_code, section_type_code, class_type_code, details, description,
                        document_path, issued_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const values = [codeNew, name, duration, education_type, level_type,
                         section_type, class_type, structure, description, finalPath, issued_on];

          await db.query(query, values);
          
          return res.json({ 
            message: 'Curriculum added successfully',
            type: 'success' 
          });
        } else {
          // Handle non-Manual case - pass to Flask API
          const finalUploadDir = path.join(__dirname, '../../data/uploads');
          if (!fs.existsSync(finalUploadDir)) { 
            fs.mkdirSync(finalUploadDir, { recursive: true });
          }
          const filepath = req.file.path;
          const finalFilename = code + "_" + Date.now() + path.extname(req.file.originalname);
          const finalPath = path.join(finalUploadDir, finalFilename);
          // Remove the temp file after reading
          const jsonData = {
            code,
            issued_on,
            name,
            education_type,
            level_type,
            section_type,
            class_type,
            description,
            duration,
            document: filepath,
            document_path: finalPath,
          };

          const response = await axios.post(
            'http://localhost:8080/add-curriculum',
            jsonData,
            {
              headers: {
                'Content-Type': 'application/json',
              }

            }
          );
          // Move file from temp location to permanent location
         
          fs.renameSync(req.file.path, finalPath);
          
          return res.json(
            {
              type:response.data.type,
              message: response.data.message,
            }
          );
        }
      } catch (error) {
        // Clean up temp file if something went wrong
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error('Error details:', error);
       return res.json({
          message: 'Curriculum processing failed',
          error: error.message,
          type:'error'
        });
      }
    });
  } catch (error) {
    console.error('Outer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, type:'error' });
  }
};
const getCurriculumTypes = async ({education_type_code, level_type_code, section_type_code, class_type_code}) => {
  try {
    const query = `SELECT * FROM curricula WHERE education_type_code = ? AND level_type_code = ? AND section_type_code = ? AND class_type_code = ?`;
    const values = [education_type_code, level_type_code, section_type_code, class_type_code];
    const [rows] = await db.query(query, values);
    
    if (rows.length === 0) {
      return { message: 'No Curriculum - Course found', type: 'error' };
    }
    
    return { curriculumTypes: rows, type: 'success' };
  } catch (error) {
    console.error('Error fetching curriculum types:', error);
    return { message: error.message, type: 'error' };
  }
}
const assignCurriculum = async ({teacherCode,courses,school}) => {
  try {
    
    if (!teacherCode || !courses || school === 0) {
      return res.status(400).json({ message: 'Teacher and at least one course are required', type: 'error' });
    }
    const teacherCourses = courses
    ? JSON.stringify(courses.map(course => course.code))
    : null;
  const query = `update teachers set curricula_code=? where code=? and school_code=?)`;
  const [result]= await db.query(query, [ teacherCourses, teacherCode, school]);
    
    if (result.affectedRows === 0) {
      return ({ message: 'Failed to assign courses', type: 'error' });
    }    
   return ({ message: 'Courses assigned successfully', type: 'success' });
  } catch (error) {
    console.error('Error assigning courses:', error);
    return ({ message: error.message, type: 'error' });
  }
};
const getCurriculumPerTeachers = async ({id, role}) => {
  try {
    if (!role || !id) {
      return { message: 'User id and User role are required', type: 'error' };
    }
    if (role === 'Teacher') {
      const query = `
      SELECT t.*,s.code,s.name as school_name FROM teachers t join schools s on
      t.school_code=s.code
      WHERE t.code = ? and t.curricula_code IS NOT NULL
      `;
      const values = [id];
      const [rows] = await db.query(query, values);

      if (rows.length === 0) {
        return { message: 'You are not assigned any course', type: 'error' };
      }

      const Codes = JSON.parse(rows[0].curricula_code || '[]');
      if (Codes.length === 0) {
        return { message: 'No curricula codes found for the teacher', type: 'error' };
      }

      const placeholders = Codes.map(() => '?').join(',');
      const curriculumQuery = `
      SELECT cu.name, cu.code as course_code,ed.code,ed.name as education_name,
        cu.class_type_code as class_name,
        lt.code,lt.name as level_name,
        st.code,st.name as section_name FROM curricula cu 
        join education_types ed on cu.education_type_code=ed.code
        join level_types lt on cu.level_type_code=lt.code
        join section_types st on cu.section_type_code=st.code
        WHERE cu.code IN (${placeholders})
      `;
      const [curriculumRows] = await db.query(curriculumQuery, Codes);

      const teacherName = rows[0].firstname+" "+rows[0].lastname;
      const schoolName = rows[0].school_name;
      const courses = curriculumRows.map(row => ({
        name: row.name,
        code: row.course_code,
        education_name: row.education_name,
        level_name: row.level_name,
        section_name: row.section_name,
        class_name: row.class_name,
        teacher: teacherName,
        school: schoolName
      }));
      return { courses: courses, type: 'success' };
    }
    if (role === "School") {
      const query = `SELECT t.*,s.name as school_name FROM teachers t join schools s on t.school_code=s.code  WHERE t.school_code = ? and t.curricula_code IS NOT NULL`;
      const values = [id];
      const [rows] = await db.query(query, values);

      if (rows.length === 0) {
        return { message: 'You are not assigned any course', type: 'error' };
      }

      // For each teacher, get their curricula and name
      let courses = [];
      for (const teacher of rows) {
        const Codes = JSON.parse(teacher.curricula_code || '[]');
        if (Codes.length === 0) continue;

        const placeholders = Codes.map(() => '?').join(',');
        const curriculumQuery = `SELECT cu.name, cu.code as course_code,ed.code,ed.name as education_name,
        cu.class_type_code as class_name,
        lt.code,lt.name as level_name,
        st.code,st.name as section_name FROM curricula cu 
        join education_types ed on cu.education_type_code=ed.code
        join level_types lt on cu.level_type_code=lt.code
        join section_types st on cu.section_type_code=st.code
        WHERE cu.code IN (${placeholders})`;
        const [curriculumRows] = await db.query(curriculumQuery, Codes);

        curriculumRows.forEach(row => {
          courses.push({
            name: row.name,
            code: row.course_code,
            school: teacher.school_name,
            teacher: teacher.firstname+" "+teacher.lastname,
            education_name: row.education_name, 
            level_name: row.level_name,
            section_name: row.section_name,
            class_name: row.class_name
          });
        });
      }
       
      if (courses.length === 0) {
        return { message: 'No curricula codes found for the teachers', type: 'error' };
      }

      return { courses: courses, type: 'success' };
    }
  } catch (error) {
    console.error('Error fetching curriculum types:', error);
    return { message: error.message, type: 'error' };
  }
}
const getCurriculumSelected = async ({course}) => {
  try {
    if (!course) {
      return { message: 'Course code is required', type: 'error' };
    }
    const query = `
      SELECT cu.*, 
         lt.name AS level_type_name, 
         st.name AS section_type_name,
         et.name AS education_type_name
      FROM curricula cu
      LEFT JOIN level_types lt ON cu.level_type_code = lt.code
      LEFT JOIN section_types st ON cu.section_type_code = st.code
      LEFT JOIN education_types et ON cu.education_type_code = et.code
      WHERE cu.code = ?`;
    const values = [course];
    const [rows] = await db.query(query, values);

    if (rows.length === 0) {
      return { message: 'Course details not found', type: 'error' };
    }

    return { courseSelected: rows, type: 'success' };
    
  } catch (error) {
    console.error('Error fetching curriculum types:', error);
    return { message: error.message, type: 'error' };
  }
}
const getCurriculaList = async ({id,role}) => {
  try {
    if(!role || !id) {
      return { message: 'User id and User role are required', type: 'error' };
    }
    if(role === 'Administrator' || role==="Staff") {
    const query = `SELECT cu.*,cu.code as curriculum_code,et.code,et.name as education_name,
    lt.code,lt.name as level_name,
    st.code,st.name as section_name FROM curricula cu
    join education_types et on cu.education_type_code=et.code
    join level_types lt on cu.level_type_code=lt.code
    join section_types st on cu.section_type_code=st.code order by cu.name, et.name, lt.name, st.name`;
    const [rows] = await db.query(query);
    
    if (rows.length === 0) {
      return { message: 'No Curriculum - Course found', type: 'error' };
    }
    
    return { curriculaList: rows, type: 'success' };
  }
  } catch (error) {
    console.error('Error fetching curriculum types:', error);
    return { message: error.message, type: 'error' };
  }
}
module.exports = { 
  addCurriculum , getCurriculumTypes,assignCurriculum,getCurriculumPerTeachers, getCurriculumSelected,
  getCurriculaList
};