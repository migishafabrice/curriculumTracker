const { db } = require('../config/config');

const addEducationType = async (req, res) => {
    const { name, code, description } = req.body;

    // Check if all required fields are provided
    if (!name || !code || !description) {
        return res.status(400).json({
            message: "Fill required fields",
            error: "Empty fields not allowed.",
        });
    }

    try {
        // Check if the name or code already exists
        const [existingName] = await db.query(
            "SELECT * FROM education_types WHERE name = ?",
            [name]
        );
        const [existingCode] = await db.query(
            "SELECT * FROM education_types WHERE code = ?",
            [code]
        );

        if (existingName.length > 0) {
            return res.status(400).json({
                message: "Education type with this name already exists.",
                error: "Duplicate name.",
                type: "error",
            });
        }

        if (existingCode.length > 0) {
            return res.status(400).json({
                message: "Education type with this code already exists.",
                error: "Duplicate code.",
                type: "error",
            });
        }

        // Insert into DB
        const [query] = await db.query(
            "INSERT INTO education_types (name, code, description, active) VALUES (?, ?, ?, ?)",
            [name, code, description, true]
        );

        // Check if insertion is successful
        if (query.affectedRows === 0) {
            return res.status(500).json({
                message: "Something went wrong, education type not recorded.",
                error: "Error inserting data.",
                type: "error",
            });
        }

        // Respond with success
        res.status(201).json({
            message: "Education type added successfully.",
            type: "success",
            data: { name, code, description },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong, education type not recorded.",
            error: error.message,
            type: "error",
        });
    }
};

const addLevelType = async (req, res) => {
    const { name, code, education_type, classes, description } = req.body;

    // Check if all required fields are provided
    if (!name || !code || !education_type || !classes|| !description) {
        return res.status(400).json({
            message: "Please fill all required fields: name, code, education_type, classes and description.",
            error: "Empty fields not allowed.",
        });
    }

    try {
        // Check if the name or code already exists
        const [existingLevelType] = await db.query(
            "SELECT * FROM level_types WHERE name = ? OR code = ?",
            [name, code]
        );

        if (existingLevelType.length > 0) {
            const duplicateField = existingLevelType.some(level => level.name === name) ? 'name' : 'code';
            return res.status(400).json({
                message: `Level type with this ${duplicateField} already exists.`,
                error: `Duplicate ${duplicateField}.`,
                type: "error",
            });
        }
        const escapedClasses = db.escape(classes);
        // Insert into DB
        const [query] = await db.query(
            "INSERT INTO level_types (name, code, education_type_code, classes, description, active) VALUES (?, ?, ?, ?, ?, ?)",
            [name, code, education_type,escapedClasses, description, true]
        );

        // Check if insertion is successful
        if (query.affectedRows === 0) {
            return res.status(500).json({
                message: "Something went wrong, level type not recorded.",
                error: "Error inserting data.",
                type: "error",
            });
        }

        // Respond with success
        res.status(201).json({
            message: "Level type added successfully.",
            type: "success",
            data: { name, code, education_type, description },
        });
    } catch (error) {
        console.error("Error in addLevelType:", error);
        res.status(500).json({
            message: "Something went wrong, level type not recorded."+error,
            error: error.message,
            type: "error",
        });
    }
};

const addSectionType = async (req, res) => {
    const { name, code, education_type, level_type, description } = req.body;

    // Check if all required fields are provided
    if (!name || !code || !education_type || !level_type || !description) {
        return res.status(400).json({
            message: "Please fill all required fields: name, code, education, level, and description.",
            error: "Empty fields not allowed.",
        });
    }

    try {
        // Check if the name or code already exists
        const [existingSectionType] = await db.query(
            "SELECT * FROM section_types WHERE name = ? OR code = ?",
            [name, code]
        );

        if (existingSectionType.length > 0) {
            const duplicateField = existingSectionType.some(section => section.name === name) ? 'name' : 'code';
            return res.status(400).json({
                message: `Section type with this ${duplicateField} already exists.`,
                error: `Duplicate ${duplicateField}.`,
                type: "error",
            });
        }

        // Insert into DB
        const [query] = await db.query(
            "INSERT INTO section_types (name, code, level_type_code, description, active) VALUES (?, ?, ?, ?, ?, ?)",
            [name, code, level_type, description, true]
        );

        // Check if insertion is successful
        if (query.affectedRows === 0) {
            return res.status(500).json({
                message: "Something went wrong, section type not recorded.",
                error: "Error inserting data.",
                type: "error",
            });
        }

        // Respond with success
        res.status(201).json({
            message: "Section type added successfully.",
            type: "success",
            data: { name, code, education_type, level_type, description },
        });
    } catch (error) {
        console.error("Error in addSectionType:", error);
        res.status(500).json({
            message: "Something went wrong, section type not recorded.",
            error: error.message,
            type: "error",
        });
    }
};
const getEducationTypes = async (req, res) => {
    try {
        // Retrieve all education types from the database
        const [educationTypes] = await db.query("SELECT * FROM education_types order by name asc");
        // Respond with the retrieved data
        res.status(200).json({
            type: "success",
            educationTypes: educationTypes,
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while retrieving education types."+ error.message,
            type: "error",
        });
    }
};
const getLevelTypes = async (req, res) => {
    try {
        const { education_type_code } = req.query;

        if (!education_type_code) {
            return res.status(400).json({
                type: "error",
                message: "education_type_code is required as a query parameter"
            });
        }

        const [levelTypes] = await db.query(
            "SELECT * FROM level_types WHERE education_type_code = ? ORDER BY name ASC",
            [education_type_code]
        );

        res.status(200).json({
            type: "success",
            levelTypes: levelTypes,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch level types: " + error.message,
            type: "error",
        });
    }
};
const getSectionTypes = async (req, res) => {
    try {
        const { level_type_code } = req.query;

        if (!level_type_code) {
            return res.status(400).json({
                type: "error",
                message: "Catgeory is required"
            });
        }
const [sectionTypes] = await db.query(
            `SELECT section_types.*,level_types.classes FROM section_types 
JOIN level_types ON section_types.level_type_code = level_types.code
WHERE section_types.level_type_code = ?
ORDER BY section_types.name,level_types.classes ASC`,
            [level_type_code]
        );
    if (sectionTypes[0]) {
        res.status(200).json({
            message:"YES",
            type: "success",
            sectionTypes: sectionTypes,
        });
    } else {
        const [classes] = await db.query(
            `SELECT * FROM level_types
WHERE code = ?
ORDER BY classes ASC`,
            [level_type_code]
        );
        if (classes[0]) {
            res.status(200).json({
                message:"NO",
                type: "success",
                sectionTypes: classes,
            });
        }
    }
       
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch level types: " + error.message,
            type: "error",
        });
    }
};
module.exports = { addSectionType, addLevelType, addEducationType , getEducationTypes,getLevelTypes,getSectionTypes};