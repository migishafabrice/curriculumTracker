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
    const { name, code, education_type, description } = req.body;

    // Check if all required fields are provided
    if (!name || !code || !education_type || !description) {
        return res.status(400).json({
            message: "Please fill all required fields: name, code, education_type, and description.",
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

        // Insert into DB
        const [query] = await db.query(
            "INSERT INTO level_types (name, code, education_type, description, active) VALUES (?, ?, ?, ?, ?)",
            [name, code, education_type, description, true]
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
            message: "Something went wrong, level type not recorded.",
            error: error.message,
            type: "error",
        });
    }
};

const addSectionType = async (req, res) => {
    const { name, code, education_type, level, description } = req.body;

    // Check if all required fields are provided
    if (!name || !code || !education_type || !level || !description) {
        return res.status(400).json({
            message: "Please fill all required fields: name, code, education_type, level, and description.",
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
            "INSERT INTO section_types (name, code, education_type, level, description, active) VALUES (?, ?, ?, ?, ?, ?)",
            [name, code, education_type, level, description, true]
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
            data: { name, code, education_type, level, description },
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

module.exports = { addSectionType, addLevelType, addEducationType };