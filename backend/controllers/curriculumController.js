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

          const query = `INSERT INTO curriculum (code, name, duration, education_type_code, 
                        level_type_code, section_type_code, class_type_code, details, description,
                        document_path, issued_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const values = [codeNew, name, duration, education_type, level_type,
                         section_type, class_type, structure, description, finalPath, issued_on];

          await db.query(query, values);
          
          res.status(201).json({ 
            message: 'Curriculum added successfully',
            type: 'success' 
          });
        } else {
          // Handle non-Manual case - pass to Flask API
          const fileContent = fs.readFileSync(req.file.path);
          
          // Remove the temp file after reading
          fs.unlinkSync(req.file.path);

          const jsonData = {
            name,
            education_type,
            level_type,
            section_type,
            class_type,
            description,
            duration,
            document: fileContent.toString('base64')
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

          res.status(response.status).json(response.data);
        }
      } catch (error) {
        // Clean up temp file if something went wrong
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error('Error details:', error);
        res.status(500).json({
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
    const query = `SELECT * FROM curriculum WHERE education_type_code = ? AND level_type_code = ? AND section_type_code = ? AND class_type_code = ?`;
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
  const query = `INSERT INTO courses (teacher_code, curriculum_code, school_code) VALUES (?, ?, ?)`;
  const [result]= await db.query(query, [teacherCode, teacherCourses, school]);
    
    if (result.affectedRows === 0) {
      return ({ message: 'Failed to assign courses', type: 'error' });
    }    
   return ({ message: 'Courses assigned successfully', type: 'success' });
  } catch (error) {
    console.error('Error assigning courses:', error);
    return ({ message: error.message, type: 'error' });
  }
};
module.exports = { 
  addCurriculum , getCurriculumTypes,assignCurriculum
};