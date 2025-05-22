const e = require('express');
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
            "INSERT INTO section_types (name, code, level_type_code, description, active) VALUES (?, ?, ?, ?, ?)",
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
const getEducationTypes = async ({ school_code }) => {
    try {
        
        if(!school_code) {
        const [educationTypes] = await db.query(
            "SELECT * FROM education_types ORDER BY name ASC"
            
        );
        
        if (!educationTypes.length=== 0) {
            return {
                type: "error",
                message: "No education types found.",
            };
        }
       return  ({
            type: "success",
            educationTypes: educationTypes,   
         });
        }
    
         if (school_code) {
             const [schoolSections] = await db.query(
                    "SELECT section_types AS section FROM schools WHERE code = ?",
                    [school_code]
                );
        
                if (!schoolSections.length) {
                    ({ 
                        type: "error", 
                        message: "School not found or School has not sections registered." 
                    });
                }
                const sectionCodes = JSON.parse(schoolSections[0]?.section || "[]");
                if (!sectionCodes.length) {
                    ({ 
                        type: "error", 
                        message: "No sections found for this school.",
                        
                    });
                }
                
              const [educationTypes] = await db.query(`
                    SELECT DISTINCT et.*  
                    FROM section_types st
                    JOIN level_types lt ON st.level_type_code = lt.code
                    JOIN education_types et ON lt.education_type_code = et.code
                    WHERE st.code IN (?)
                    ORDER BY et.name ASC
                `, [sectionCodes]);
                if(!educationTypes.length===0) {
                    return res.status(200).json({
                        type: "error",
                        message: "No education types found for this school.",
                       
                    });
                }
                
                return ({ 
                    type: "success", 
                    educationTypes: educationTypes
                });
            }
            
            }
    
catch (error) {
        // Handle errors and return an error response
        return {
            type: "error",
            message: "Something went wrong while retrieving education types: " + error.message,
        };
    }
};
const getLevelTypes = async ({education_type_code,school_code}) => {
    try {
       
        if (!education_type_code) {
            return({
                type: "error",
                message: "education_type_code is required as a query parameter"
            });
        }
        
        if(!school_code) {
            
            const [levelTypes] = await db.query(
                "SELECT * FROM level_types WHERE education_type_code = ? ORDER BY name ASC",
                [education_type_code]
            );
            if (!levelTypes.length=== 0) {
                return {
                    type: "error",
                    message: "No level types found.",
                };
            }
            return {
                type: "success",
                levelTypes: levelTypes,
            };
        }
        if(school_code){
        
            const [schoolSections] = await db.query(
                "SELECT section_types AS section FROM schools WHERE code = ?",
                [school_code]
            );
    
            if (!schoolSections.length) {
                return ({ 
                    type: "error", 
                    message: "School not found or School has not sections registered." 
                });
            }
            const sectionCodes = JSON.parse(schoolSections[0]?.section || "[]");
            if (!sectionCodes.length) {
                return ({ 
                    type: "error", 
                    message: "No sections found for this school."
                });
            }
           
          const [levelTypes] = await db.query(`
                SELECT DISTINCT lt.*  
                FROM section_types st
                JOIN level_types lt ON st.level_type_code = lt.code
                JOIN education_types et ON lt.education_type_code = et.code
                WHERE st.code IN (?) AND et.code = ?
                ORDER BY lt.name ASC
            `, [sectionCodes,education_type_code]);
            if(!levelTypes.length===0) {
                return ({
                    type: "error",
                    message: "No level types found for this school.",
                    levelTypes: [],
                });
            }
            
            return ({ 
                type: "success", 
                levelTypes: levelTypes
            });
        }
    } 
    catch (error) {
        return({
            message: "Failed to fetch level types: " + error.message,
            type: "error",
        });
    }
};
const getSectionTypes = async ({level_type_code,school_code}) => {
    try {
       
        if (!level_type_code) {
            return({
                type: "error",
                message: "Level is required"
            });
        }
        
        if(!school_code) {
            
            const [sectionTypes] = await db.query(
                "SELECT * FROM section_types WHERE level_type_code = ? ORDER BY name ASC",
                [level_type_code]
            );
            if (!sectionTypes.length=== 0) {
                return {
                    type: "error",
                    message: "No Sections found.",
                };
            }
            return {
                type: "success",
                sectionTypes: sectionTypes,
            };
        }
        if(school_code){
        
            const [schoolSections] = await db.query(
                "SELECT section_types AS section FROM schools WHERE code = ?",
                [school_code]
            );
    
            if (!schoolSections.length) {
                return ({ 
                    type: "error", 
                    message: "School not found or School has not sections registered." 
                });
            }
            const sectionCodes = JSON.parse(schoolSections[0]?.section || "[]");
            if (!sectionCodes.length) {
                return ({ 
                    type: "error", 
                    message: "No sections found for this school."
                });
            }
           
          const [sectionTypes] = await db.query(`
                SELECT DISTINCT st.*  
                FROM section_types st
                JOIN level_types lt ON st.level_type_code = lt.code
                WHERE st.code IN (?) AND lt.code = ?
                ORDER BY lt.name ASC
            `, [sectionCodes,level_type_code]);
            
            if(!sectionTypes.length===0) {
                return ({
                    type: "error",
                    message: "No sections found for this school.",
                    sectionTypes: [],
                });
            }
            
            return ({ 
                type: "success", 
                sectionTypes: sectionTypes
            });
        }
    } 
    catch (error) {
        return({
            message: "Failed to fetch level types: " + error.message,
            type: "error",
        });
    }
};
const getClassTypes = async ({level_type_code}) => {
    
    try {
        if (!level_type_code) {
            return({
                type: "error",
                message: "Level is required"
            });
        }
         const [classTypes] = await db.query(
                "SELECT classes FROM level_types WHERE code = ?",
                [level_type_code]
            );
            
            if (!classTypes.length=== 0) {
                return {
                    type: "error",
                    message: "No classes found.",
                };
            }
            return {
                type: "success",
                classTypes: classTypes,
            };
        }
    
    catch (error) {
        return({
            message: "Failed to fetch level types: " + error.message,
            type: "error",
        });
    }
}
const getDepartments = async ({ userid, userrole }) => {
    try {
        if (!userid) {
            return {
                type: "error",
                message: "User ID is required"
            };
        }
        if (!userrole) {
            return {
                type: "error",
                message: "User role is required"
            };
        }

        let educationTypes = [];
        if (userrole === 'Administrator' || userrole === 'Staff') {
            // Scenario 1: Get all education types with their levels, sections, and classes
            const [eduTypes] = await db.query(
                "SELECT code, name FROM education_types WHERE active = true ORDER BY name ASC"
            );
            if (eduTypes.length> 0) {
            for (const eduType of eduTypes) {
                const [levels] = await db.query(
                    "SELECT code, name, classes FROM level_types WHERE education_type_code = ? AND active = true ORDER BY name ASC",
                    [eduType.code]
                );
                if (levels.length === 0) {
                    educationTypes.push({
                        ...eduType,
                        levels: ["No levels found"]
                    });
                }
                
                const levelsWithSections = await Promise.all(levels.map(async (level) => {
                    const classes = level.classes ? level.classes.split(',').map(c => c.trim()) : [];
                    const [sections] = await db.query(
                        "SELECT code, name FROM section_types WHERE level_type_code = ? AND active = true ORDER BY name ASC",
                        [level.code]
                    );
                    if (sections.length === 0) {
                        return {
                            ...level,
                            sections: ["No sections found"],
                            classes
                        };
                    }
                    // Convert classes string to array of numbers
                    

                    return {
                        ...level,
                        classes,
                        sections
                    };
                }));

                educationTypes.push({
                    ...eduType,
                    levels: levelsWithSections
                });
            }
        }
        else {
            return {
                educationTypes: ["No education types found"],
            };
        }
    } 
    else if (userrole === 'School') {
            // Scenario 2: Get school's sections and work backwards
            const [schoolData] = await db.query(
                "SELECT section_types FROM schools WHERE code = ?",
                [userid]
            );

            if (!schoolData.length) {
                return {
                    type: "error",
                    message: "School not found"
                };
            }

            const sectionCodes = JSON.parse(schoolData[0].section_types || "[]");
            
            if (sectionCodes.length === 0) {
                return {
                    type: "error",
                    message: "No sections assigned to this school"
                };
            }

            // Get all sections with their levels and education types
            const [sections] = await db.query(
                `SELECT st.code as section_code, st.name as section_name, 
                 lt.code as level_code, lt.name as level_name, lt.classes,
                 et.code as edu_code, et.name as edu_name
                 FROM section_types st
                 JOIN level_types lt ON st.level_type_code = lt.code
                 JOIN education_types et ON lt.education_type_code = et.code
                 WHERE st.code IN (?)`,
                [sectionCodes]
            );

            // Organize into hierarchical structure
            const eduTypeMap = new Map();
            
            for (const section of sections) {
                // Convert classes string to array of numbers
                const classes = section.classes ? section.classes.split(',').map(c => c.trim()) : [];
                
                const levelData = {
                    code: section.level_code,
                    name: section.level_name,
                    classes,
                    sections: [{
                        code: section.section_code,
                        name: section.section_name
                    }]
                };

                const eduTypeData = {
                    code: section.edu_code,
                    name: section.edu_name,
                    levels: [levelData]
                };

                if (eduTypeMap.has(section.edu_code)) {
                    const existingEduType = eduTypeMap.get(section.edu_code);
                    const existingLevel = existingEduType.levels.find(l => l.code === section.level_code);
                    
                    if (existingLevel) {
                        // Add section to existing level
                        if (!existingLevel.sections.some(s => s.code === section.section_code)) {
                            existingLevel.sections.push({
                                code: section.section_code,
                                name: section.section_name
                            });
                        }
                    } else {
                        // Add new level to existing education type
                        existingEduType.levels.push(levelData);
                    }
                } else {
                    eduTypeMap.set(section.edu_code, eduTypeData);
                }
            }

            educationTypes = Array.from(eduTypeMap.values());
        } else if (userrole === 'Teacher') {
            // Scenario 3: Get teacher's courses and work backwards
            const [teacherCourses] = await db.query(
                "SELECT curriculum_code FROM courses WHERE teacher_code = ?",
                [userid]
            );

            if (!teacherCourses.length) {
                return {
                    type: "error",
                    message: "Teacher not found"
                };
            }
            
            const courseCodes = JSON.parse(teacherCourses[0].curriculum_code || "[]");
            console.log("teacherCourses",courseCodes);
            if (courseCodes.length === 0) {
                return {
                    type: "error",
                    message: "No courses assigned to this teacher"
                };
            }

            // Get all courses with their curriculum info
            const [courses] = await db.query(
                `SELECT cu.code as course_code, cu.name as course_name,
                 cu.section_type_code, cu.level_type_code, cu.education_type_code,
                 cu.class_type_code,
                 st.name as section_name,
                 lt.name as level_name, lt.classes,
                 et.name as edu_name
                 FROM curricula cu
                 JOIN section_types st ON cu.section_type_code = st.code
                 JOIN level_types lt ON cu.level_type_code = lt.code
                 JOIN education_types et ON cu.education_type_code = et.code
                 WHERE cu.code IN (?)`,
                [courseCodes]
            );

            // Organize into hierarchical structure
            const eduTypeMap = new Map();
            
            for (const course of courses) {
                // Convert classes string to array of numbers
                let classes = course.class_type_code ? course.class_type_code.split(',').map(c => c.trim()) : [];
                
                if (eduTypeMap.has(course.edu_type_code)) {
                    const existingEduType = eduTypeMap.get(course.edu_type_code);
                    const existingLevel = existingEduType.levels.find(l => l.code === course.level_code);
                    
                    if (existingLevel) {
                        const existingSection = existingLevel.sections.find(s => s.code === course.section_code);
                        
                        if (existingSection) {
                            // Add course to existing section
                            if (!existingSection.courses.some(c => c.code === course.course_code)) {
                                existingSection.courses.push({
                                    code: course.course_code,
                                    name: course.course_name
                                });
                            }
                        } else {
                            // Add new section to existing level
                            existingLevel.sections.push({
                                code: course.section_code,
                                name: course.section_name,
                                courses: [{
                                    code: course.course_code,
                                    name: course.course_name
                                }]
                            });
                        }

                        // Update classes if they have changed
                        if (existingLevel.classes) {
                            const existingClasses = new Set(existingLevel.classes);
                            classes.forEach(cls => existingClasses.add(cls));
                            classes = Array.from(existingClasses);
                        }
                    } else {
                        // Add new level to existing education type
                        existingEduType.levels.push({
                            code: course.level_code,
                            name: course.level_name,
                            classes,
                            sections: [{
                                code: course.section_code,
                                name: course.section_name,
                                courses: [{
                                    code: course.course_code,
                                    name: course.course_name
                                }]
                            }]
                        });
                    }
                } else {
                    // Add new education type
                    eduTypeMap.set(course.edu_type_code, {
                        code: course.edu_type_code,
                        name: course.edu_name,
                        levels: [{
                            code: course.level_code,
                            name: course.level_name,
                            classes,
                            sections: [{
                                code: course.section_code,
                                name: course.section_name,
                                courses: [{
                                    code: course.course_code,
                                    name: course.course_name
                                }]
                            }]
                        }]
                    });
                }
                
                const sectionData = {
                    code: course.section_code,
                    name: course.section_name,
                    courses: [{
                        code: course.course_code,
                        name: course.course_name
                    }]
                };

                const levelData = {
                    code: course.level_code,
                    name: course.level_name,
                    classes,
                    sections: [sectionData]
                };

                const eduTypeData = {
                    code: course.edu_type_code,
                    name: course.edu_name,
                    levels: [levelData]
                };

                if (eduTypeMap.has(course.edu_type_code)) {
                    const existingEduType = eduTypeMap.get(course.edu_type_code);
                    const existingLevel = existingEduType.levels.find(l => l.code === course.level_code);
                    
                    if (existingLevel) {
                        const existingSection = existingLevel.sections.find(s => s.code === course.section_code);
                        
                        if (existingSection) {
                            // Add course to existing section
                            if (!existingSection.courses.some(c => c.code === course.course_code)) {
                                existingSection.courses.push({
                                    code: course.course_code,
                                    name: course.course_name
                                });
                            }
                        } else {
                            // Add new section to existing level
                            existingLevel.sections.push(sectionData);
                        }
                    } else {
                        // Add new level to existing education type
                        existingEduType.levels.push(levelData);
                    }
                } else {
                    eduTypeMap.set(course.edu_type_code, eduTypeData);
                }
            }

            educationTypes = Array.from(eduTypeMap.values());
        } else {
            return {
                type: "error",
                message: "Invalid user role"
            };
        }

        if (educationTypes.length === 0) {
            return {
                type: "error",
                message: "No departments found for this user"
            };
        }

        return {
            type: "success",
            departments: educationTypes
        };
    } catch (error) {
        console.error("Error in getDepartments:", error);
        return {
            type: "error",
            message: "Failed to fetch departments: " + error.message
        };
    }
};
module.exports = { addSectionType, addLevelType, addEducationType ,
     getEducationTypes,getLevelTypes,getSectionTypes, getClassTypes,
    getDepartments};