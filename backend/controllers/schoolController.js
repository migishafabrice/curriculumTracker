const { Pool } = require('pg');
const argon = require("argon2"); 
require("dotenv").config();
function generateRandomPassword(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}
const db = new Pool ({
    user: process.env.DBUSERNAME,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
});
const addSchool = async (req, res) => {
  const { name, phone, email, address } = req.body;
  const logo = req.file; // Getting logo file from request

  // Check if all required fields and logo are provided
  if (!name || !phone || !email || !address || !logo) {
    return res.status(400).json({
      message: 'Fill required fields',
      error: 'Empty fields not allowed.'
    });
  }

  try {
    // Generate a random password
    const password = generateRandomPassword();
    const hashedPassword = await argon.hash(password);
    // Save the file path to the logo (relative path)
    const logoPath = `/uploads/logos/${logo.filename}`; 
    const lastIdQuery = await db.query(
        "SELECT COALESCE(MAX(id), 0) AS last_id FROM schools"
    );
    let code;
    let lastId = parseInt(lastIdQuery.rows[0].last_id);
    if (lastId === 0) {
      lastId = 1; 
        } else {
      lastId += 1; // Increment the last ID
        }
    // Insert into DB
    code=lastId+"-SCH";
    const query = await db.query(
      "INSERT INTO schools(school_id,school_name, telephone, email, address, password, active, logo) VALUES($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *",
      [code,name, phone, email, address, hashedPassword, true, logoPath]
    );
    // Check if insertion is successful
    if (query.rows.length === 0) {
      return res.status(500).json({
        message: "Something went wrong, school not recorded.",
        error: "Error inserting data."
      });
    }

    // Respond with success
    res.status(201).json({
      message: "School added successfully.",
      type: "success",
      data: query.rows[0] // Returning the inserted school data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong, school not recorded.",
      error: error.message,
      type: "error"
    });
  }
};
const getSchools = (req, res) => {
  db.query("SELECT * FROM schools ORDER BY school_name, address ASC", (err, results) => {
    if (err) {
      console.error("Error fetching schools:", err);
      return res.status(500).json({
        message: "An error occurred while fetching schools",
        schools: [],
        type: "error",
      });
    }

    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "No schools found",
        schools: [],
        type: "error",
      });
    }

    return res.status(200).json({
      message: "Schools found",
      schools: results.rows,
      type: "success",
    });
  });
};

module.exports = { addSchool,getSchools };
