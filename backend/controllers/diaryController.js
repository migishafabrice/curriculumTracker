const { db } = require('../config/config');
const addDiaryEntry = async (req, res) => {
    try {
        const { teacher_code, course_code, date,
            activities,
            homework,
            additional_notes,
            status,
            learning_outcomes,
            period} = req.body;
        const query = `INSERT INTO diaries(
         teacher_code, curriculum_code, 
         learningoutcome, activities, homework,additional_notes,periods,
         date,  observation, status) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
         
        const values = [
            teacher_code,
            course_code,
            JSON.stringify(learning_outcomes),
            activities,
            homework,
            additional_notes,
            period,
            new Date(date).toISOString().slice(0, 19).replace('T', ' '),
            "-",
            status
        ];
        const[result]=await db.query(query, values);
        if (result.affectedRows === 0) {
            return res.json({ message: "Failed to add diary entry", type: "error" });
        }
        return res.json({ message: "Diary entry added successfully", type: "success" });
    } catch (error) {
        console.error("Error adding diary entry:", error);
        return res.json({ message: "Error adding diary entry", type: "error" });
    }
}
const getDiaries = async (req, res) => {
    try {
        const { teacher_code} = req.body;
        const query = `SELECT di.*,di.curriculum_code as course_code,cu.name as course_name,
        cu.class_type_code,cu.class_type_code as class_name,
         st.code,st.name as section_name  FROM diaries di
        join curricula cu on di.curriculum_code=cu.code 
        join section_types st on cu.section_type_code=st.code WHERE di.teacher_code = ? 
        ORDER BY created_at DESC`;
        const values = [teacher_code];
        const [result] = await db.query(query, values);
        if (result.length === 0) {
            return res.json({ message: "No diary entries found", type: "error" });
        }
        return res.json({ type: "success", diaries: result });
    } catch (error) {
        console.error("Error retrieving diary entries:", error);
        return res.json({ message: "Error retrieving diary entries", type: "error" });
    }
}
module.exports = {addDiaryEntry,getDiaries, };