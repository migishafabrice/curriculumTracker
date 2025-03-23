const { db, generateRandomPassword } = require('../config/config');

const addTeacher = async (req, res) => {
  const { firstname, lastname, phone, email, school } = req.body;
  const photo = req.file; // Getting photo file from request

  // Check if all required fields and photo are provided
  if (!firstname || !lastname || !phone || !email || !school || !photo) {
    return res.status(400).json({
      message: 'Fill required fields',
      error: 'Empty fields not allowed.',
    });
  }

  try {
    // Generate a random password
    const password = await generateRandomPassword();
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

    // Insert into DB
    const [query] = await db.query(
      "INSERT INTO teachers (code, names, school, email, telephone, password, active, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [code, `${firstname} ${lastname}`, school, email, phone, password, true, photoPath]
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
      data: { code, names: `${firstname} ${lastname}`, school, email, phone, photo: photoPath },
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
  db.query("SELECT * FROM teachers ORDER BY names, school ASC")
    .then(([results]) => {
      if (results.length === 0) {
        return res.status(404).json({
          message: "No teachers found",
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