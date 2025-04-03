const {db,generateRandomPassword}=require('../config/config');
const addSchool = async (req, res) => {
  const { name, phone, email, address } = req.body;
  const logo = req.file;
  const sections = req.body.sections ? JSON.parse(req.body.sections) : null;
    // Convert sections to database-ready format
    const dbSections = sections
    ? JSON.stringify(sections.map(section => section.option ))
    : null;
  if (!name || !phone || !email || !address || !logo || !sections) {
    return res.status(400).json({
      message: 'Fill required fields',
      error: 'Empty fields not allowed.'
    });
  }

  try {
    const password = await generateRandomPassword();
    const logoPath = `/uploads/logos/${logo.filename}`;

    // Get the last ID
    const [lastIdQuery] = await db.query(
      "SELECT COALESCE(MAX(id), 0) AS last_id FROM schools"
    );
    let lastId = parseInt(lastIdQuery[0].last_id);
    if (lastId === 0) lastId = 1;
    else lastId += 1;

    const code = `${lastId}-SCH`;

    // Insert into DB
    const [query] = await db.query(
      `INSERT INTO schools (code, name, telephone, email, address,section_types,
       password, active, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, phone, email, address,dbSections, password, true, logoPath]);

    if (query.affectedRows === 0) {
      return res.status(500).json({
        message: "Something went wrong, school not recorded.",
        error: "Error inserting data."
      });
    }

    res.status(201).json({
      message: "School added successfully.",
      type: "success",
      data: { code, name, phone, email, address, logo: logoPath }
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
  db.query("SELECT * FROM schools ORDER BY name, address ASC")
    .then(([results]) => {
      if (results.length === 0) {
        return res.status(404).json({
          message: "No schools found",
          schools: [],
          type: "error",
        });
      }

      return res.status(200).json({
        message: "Schools found",
        schools: results,
        type: "success",
      });
    })
    .catch((err) => {
      console.error("Error fetching schools:", err);
      res.status(500).json({
        message: "An error occurred while fetching schools",
        schools: [],
        type: "error",
      });
    });
};
module.exports = { addSchool,getSchools };
