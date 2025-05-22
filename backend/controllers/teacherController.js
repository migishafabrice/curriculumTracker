const argon= require("argon2");
const { db, generateRandomPassword } = require('../config/config');
const {sendEmail}=require('./emailController');
const addTeacher = async (req, res) => {
  const { firstname, lastname, phone, email,role, school } = req.body;
  const photo = req.file; // Getting photo file from request

  // Check if all required fields and photo are provided
  if (!firstname || !lastname || !phone || !email || !role || !school || !photo) {
    return res.status(400).json({
      message: 'Fill and select required fields',
      type: 'error',
    });
  }

  try {
    // Generate a random password
    const password = await generateRandomPassword();
    const hashedPassword = await argon.hash(password);
    // Save the file path to the photo (relative path)
    const photoPath = `/uploads/teachers/${photo.filename}`;

    // Get the last ID from the teachers table
    const [lastIdQuery] = await db.query(
      "SELECT COALESCE(MAX(id), 0) AS last_id FROM teachers"
    );

    // Extract the last ID
    let lastId = parseInt(lastIdQuery[0].last_id);
    if (lastId === 0) lastId = 1; // If no records, start with 1
    else lastId += 1; // Increment the last ID

    // Generate teacher code
    const code = `${lastId}-TCH`;
  const [_school]=await db.query("SELECT code,name FROM schools WHERE code = ?", [school]);
  if(!_school[0]) {
    return res.status(404).json({
      message: "School not found",
      type: "error",
    });
  }
  const mail=await sendEmail(email,"Your credentials on Curriculum Monitoring App",
`Dear ${firstname} ${lastname},

  Welcome to the Curriculum Monitoring App! Your account has been created successfully.

  Credentials:
  Username: ${email}
  Password: ${password}
  Role: ${role}
  School: ${_school[0].name}

  Please log in to your account using the credentials above.

  If you have any questions, feel free to reach out.

  Best regards,

  ***Curriculum Monitoring App Team***`
    );
    if(!mail){
      return res.status(500).json({
        message: "Something went wrong, email not sent.",
        error: "Error sending email.",
        type: "error",
      });
    }
    // Insert into DB
    const [query] = await db.query(
      `INSERT INTO teachers (code, firstname,lastname, school_code, telephone, email, role,curricula_code, password, active, photo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, firstname, lastname, school, phone, email, role,[], hashedPassword, true, photoPath]
    );

    // Check if insertion is successful
    if (query.affectedRows === 0) {
      return res.status(500).json({
        message: "Something went wrong, teacher not recorded.",
        error: "Error inserting data.",
        type: "error",
      });
    }
    // Respond with success
    res.status(201).json({
      message: "Teacher added successfully.",
      type: "success",
      data: { code, names: `${firstname} ${lastname}`, school_code, email, phone, photo: photoPath },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong, teacher not recorded.",
      error: error.message,
      type: "error",
    });
  }
};

const getTeachers = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized Access, Please login or contact the administrator",
      type: "error",
    });
  }
  const { school } = req.query;
  let query = "SELECT * FROM teachers";
  const queryParams = [];
  if (school) {
    query += " WHERE school_code = ?";
    queryParams.push(school);
  }
  query += " ORDER BY school_code,firstname,lastname ASC";
  db.query(query, queryParams)
    .then(([results]) => {
      if (results.length === 0) {
        return res.json({
          message: "No teachers found:"+queryParams,
          teachers: [],
          type: "error",
        });
      }

      return res.status(200).json({
        message: "Teachers found",
        teachers: results,
        type: "success",
      });
    })
    .catch((err) => {
      console.error("Error fetching teachers:", err);
      res.status(500).json({
        message: "An error occurred while fetching teachers",
        teachers: [],
        type: "error",
      });
    });
};

module.exports = { addTeacher, getTeachers };