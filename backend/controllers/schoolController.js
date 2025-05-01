const {db,generateRandomPassword}=require('../config/config');
const argon = require('argon2');
const { sendEmail } = require('./emailController');
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
    const hashedPassword = await argon.hash(password);
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
      [code, name, phone, email, address,dbSections, hashedPassword, true, logoPath]);

    if (query.affectedRows === 0) {
      return res.status(500).json({
        message: "Something went wrong, school not recorded.",
        error: "Error inserting data."
      });
    }
    const mail=await sendEmail(email,"Your credentials on Curriculum Monitoring App",
      `Dear ${name},
      
        Welcome to the Curriculum Monitoring App! Your account has been created successfully.
      
        Credentials:
        Username: ${email}
        Password: ${password}
        Role: School
        
      
        Please log in to your account using the credentials above.
      
        If you have any questions, feel free to reach out.
      
        Best regards,
      
        ***Curriculum Monitoring App Team***`
          );
          if(!mail){
            return res.status(500).json({
              message: "School added successfully, email not sent to school.",
              error: "Error sending email.",
              type: "error",
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
const getSchools = async (req, res) => {
  try {
    const [schools] = await db.query(`
      SELECT *
      FROM schools
      ORDER BY name, address ASC
    `);

    if (schools.length === 0) {
      return res.status(404).json({
        message: "No schools found",
        schools: [],
        type: "error",
      });
    }

    // Get all section types
    const [allSectionTypes] = await db.query('SELECT code, name FROM section_types');
    const sectionTypesMap = new Map(allSectionTypes.map(st => [st.code, st.name]));

    // Process schools
    const processedSchools = schools.map(school => {
      let sectionNames = [];
      
      try {
        const sectionCodes = school.section_types 
          ? JSON.parse(school.section_types)
          : [];
        
        // Get just the names (strings) instead of objects
        sectionNames = sectionCodes
          .map(code => sectionTypesMap.get(code))
          .filter(Boolean); // Remove undefined values
      } catch (error) {
        console.error(`Error parsing section_types for school ${school.id}:`, error);
      }

      const result = {
        id: school.id,
        name: school.name,
        telephone: school.telephone,
        email: school.email,
        address: school.address,
        logo: school.logo,
        active: school.active , // Convert to boolean
      };

      if (sectionNames.length > 0) {
        result.section_types = sectionNames; // Now an array of strings
      }

      return result;
    });

    return res.status(200).json({
      message: "Schools found",
      schools: processedSchools,
      type: "success",
    });

  } catch (err) {
    console.error("Error fetching schools:", err);
    res.status(500).json({
      message: "An error occurred while fetching schools",
      schools: [],
      type: "error",
    });
  }
};
module.exports = { addSchool,getSchools };
