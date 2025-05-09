import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./AuthUser";
import { fetchCurriculumPerTeacher, fetchCourseSelected} from "./AppFunctions";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import ToastMessage from "../ToastMessage";
import axios from "axios";

const ManageDiaries = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [courses, setCourses] = useState([]);
    const [diaryEntries, setDiaryEntries] = useState([]);
    const [notification, setNotification] = useState({ message: "", type: "" });
    
    const initialFormData = {
        course_code: "",
        teacher_code: user?.userid || "",
        date: new Date().toISOString().split('T')[0],
        activities: "",
        homework: "",
        additional_notes: "",
        status: "pending",
        learning_outcomes: [] // Array to store multiple learning outcomes
    };

    const [formData, setFormData] = useState(initialFormData);
    const [courseDetails, setCourseDetails] = useState({
        name: "",
        code: "",
        level: "",
        section: "",
        education: "",
        promotion: "",
        details: "",
    });
    
    const [learningOutcomes, setLearningOutcomes] = useState([]);
    const [topicsOptions, setTopicsOptions] = useState([]);
    const [currentLO, setCurrentLO] = useState("");
    const [currentTopics, setCurrentTopics] = useState([]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        }
    }, []);

    // Fetch courses and diary entries
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const coursesData = await fetchCurriculumPerTeacher(user.userid);
                setCourses(coursesData.map(course => ({
                    value: course.code,
                    label: `${course.name} (${course.code})`
                })));
                
                // TODO: Uncomment when you implement fetchDiaryEntries
                // const entries = await fetchDiaryEntries(user.userid);
                // setDiaryEntries(entries);
            } catch (error) {
                setNotification({ message: "Error fetching data", type: "error" });
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchData();
    }, []);

    // Parse learning outcomes when course details change
    useEffect(() => {
        if (courseDetails.details) {
            try {
                const parsedDetails = JSON.parse(courseDetails.details);
                const outcomes = parsedDetails.map(item => ({
                    value: item["Learning Outcome"],
                    label: item["Learning Outcome"],
                    content: item.content
                }));
                setLearningOutcomes(outcomes);
            } catch (error) {
                console.error("Error parsing course details:", error);
                setLearningOutcomes([]);
                setNotification({ message: "Error loading course curriculum", type: "error" });
            }
        } else {
            setLearningOutcomes([]);
        }
    }, [courseDetails.details]);

    const handleSelectCourse = async (selected) => {
        const selectedValue = selected?.value || null;
        
        setFormData(prev => ({ 
            ...prev, 
            course_code: selectedValue,
            learning_outcomes: [] // Clear existing LOs when course changes
        }));
        setLearningOutcomes([]);
        setTopicsOptions([]);
        setCurrentLO("");
        setCurrentTopics([]);
        
        if (!selectedValue) {
            setCourseDetails({
                name: "",
                code: "",
                level: "",
                section: "",
                education: "",
                promotion: "",
                details: "",
            });
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await fetchCourseSelected(selectedValue);
            const courseData = response[0]; 
            setCourseDetails({
                name: courseData.name,
                code: courseData.code,
                level: courseData.level_type_name,
                section: courseData.section_type_name,
                education: courseData.education_type_name,
                promotion: courseData.class_type_code,
                details: courseData.details,
            });
        } catch (error) {
            setNotification({ message: "Error loading course details"+error.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLearningOutcomeChange = (selected) => {
        setCurrentLO(selected?.value || "");
        
        if (selected) {
            const topics = selected.content.map(topic => ({
                value: topic,
                label: topic
            }));
            setTopicsOptions(topics);
        } else {
            setTopicsOptions([]);
        }
        setCurrentTopics([]);
    };

    const handleTopicsCoveredChange = (selected) => {
        setCurrentTopics(selected || []);
    };

    const addLearningOutcome = () => {
        if (!currentLO || currentTopics.length === 0) {
            setNotification({ 
                message: "Please select a learning outcome and at least one topic", 
                type: "error" 
            });
            return;
        }

        const newLO = {
            "Learning Outcome": currentLO,
            content: currentTopics.map(t => t.value)
        };

        setFormData(prev => ({
            ...prev,
            learning_outcomes: [...prev.learning_outcomes, newLO]
        }));

        // Reset current selections
        setCurrentLO("");
        setCurrentTopics([]);
        setTopicsOptions([]);
    };

    const removeLearningOutcome = (index) => {
        setFormData(prev => ({
            ...prev,
            learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index)
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.learning_outcomes.length === 0) {
            setNotification({ 
                message: "Please add at least one learning outcome", 
                type: "error" 
            });
            return;
        }

        setIsLoading(true);
        
        try {
            // Prepare data for submission
            const submissionData = {
                ...formData,
                learning_outcomes_json: JSON.stringify(formData.learning_outcomes)
            };

            const response = await axios.post(
                "http://localhost:5000/diary/add-diary-entry",
                submissionData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
            if (response.data.type==="error") {
                throw new Error(response.data.message);
            }
            
            setNotification({ 
                message: "Diary entry saved successfully", 
                type: "success" 
            });
            resetForm();
            
            // TODO: Uncomment when you implement fetchDiaryEntries
            // const entries = await fetchDiaryEntries(user.userid);
            // setDiaryEntries(entries);
        } catch (error) {
            setNotification({ 
                message: error.message || "Error saving diary entry", 
                type: "error" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setCourseDetails({
            name: "",
            code: "",
            level: "",
            section: "",
            education: "",
            promotion: "",
            details: "",
        });
        setLearningOutcomes([]);
        setTopicsOptions([]);
        setCurrentLO("");
        setCurrentTopics([]);
        setModal(false);
    };

    if (!user) return null;

    return (
        <>
            {notification.message && (
                <ToastMessage 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification({ message: "", type: "" })}
                />
            )}
            
            <Sidebar />
            
            <div className="page-content">
                <div id="class-diary-page" className="page">
                    <div className="page-header">
                        <h1 className="h2">Class Diary Management</h1>
                        <div>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setModal(true)}
                                
                            >
                                <i className="fas fa-plus me-1"></i>
                                Add New Diary Entry
                            </button>
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Class Diary List</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Subject</th>
                                            <th>Grade</th>
                                            <th>Teacher</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {diaryEntries.length > 0 ? (
                                            diaryEntries.map(entry => (
                                                <tr key={entry.id}>
                                                    <td>{entry.id}</td>
                                                    <td>{entry.subject}</td>
                                                    <td>{entry.grade}</td>
                                                    <td>{entry.teacher}</td>
                                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge ${entry.status === 'completed' ? 'bg-success' : 'bg-warning'} status-badge`}>
                                                            {entry.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-1">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-info me-1">
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    No diary entries found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {diaryEntries.length > 0 && (
                                <nav>
                                    <ul className="pagination justify-content-end">
                                        <li className="page-item disabled">
                                            <button className="page-link">Previous</button>
                                        </li>
                                        <li className="page-item active">
                                            <button className="page-link">1</button>
                                        </li>
                                        <li className="page-item">
                                            <button className="page-link">2</button>
                                        </li>
                                        <li className="page-item">
                                            <button className="page-link">Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Diary Modal */}
            {modal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-black text-white">
                                <h5 className="modal-title">Add New Class Diary Entry</h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={resetForm}
                                   
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="diarySubject" className="form-label">
                                                <i className="fas fa-book me-2"></i>Course
                                            </label>
                                            <Select
                                                id="diarySubject"
                                                name="course_code"
                                                options={courses}
                                                placeholder="Select a course"
                                                isSearchable
                                                isClearable
                                                onChange={handleSelectCourse}
                                                value={courses.find(c => c.value === formData.course_code)}
                                                required
                                                
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="diaryDate" className="form-label">
                                                <i className="fas fa-calendar me-2"></i>Date
                                            </label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                id="diaryDate"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                                
                                            />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-4">
                                            <label htmlFor="educationLevel" className="form-label">
                                                <i className="fas fa-graduation-cap me-2"></i>Education Level
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="educationLevel"
                                                value={courseDetails.level || ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="sectionOption" className="form-label">
                                                <i className="fas fa-layer-group me-2"></i>Section - Option
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="sectionOption"
                                                value={courseDetails.section || ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="classPromotion" className="form-label">
                                                <i className="fas fa-users me-2"></i>Class - Promotion
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="classPromotion"
                                                value={courseDetails.promotion || ""}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    {/* Learning Outcomes Section */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">
                                            <i className="fas fa-list-check me-2"></i>
                                            Learning Outcomes
                                        </h5>
                                        
                                        <div className="card mb-3">
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Learning Outcome
                                                        </label>
                                                        <Select
                                                            options={learningOutcomes}
                                                            placeholder={learningOutcomes.length ? "Select learning outcome" : "Select a course first"}
                                                            isSearchable
                                                            isClearable
                                                            onChange={handleLearningOutcomeChange}
                                                            value={learningOutcomes.find(lo => lo.value === currentLO)}
                                                            isDisabled={ !learningOutcomes.length}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Topics
                                                        </label>
                                                        <Select
                                                            options={topicsOptions}
                                                            placeholder={topicsOptions.length ? "Select topics" : "Select Learning Outocome first"}
                                                            isSearchable
                                                            isMulti
                                                            onChange={handleTopicsCoveredChange}
                                                            value={currentTopics}
                                                            isDisabled={ !topicsOptions.length}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={addLearningOutcome}
                                                            disabled={ !currentLO || currentTopics.length === 0}
                                                        >
                                                            <i className="fas fa-plus me-2"></i>
                                                            Add Learning Outcome
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Added Learning Outcomes Table */}
                                        {formData.learning_outcomes.length > 0 && (
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Learning Outcome</th>
                                                            <th>Topics Covered</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.learning_outcomes.map((lo, index) => (
                                                            <tr key={index}>
                                                                <td>{lo["Learning Outcome"]}</td>
                                                                <td>
                                                                    <ul className="mb-0">
                                                                        {lo.content.map((topic, i) => (
                                                                            <li key={i}>{topic}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => removeLearningOutcome(index)}
                                                                        
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="activities" className="form-label">
                                            <i className="fas fa-tasks me-2"></i>Class Activities
                                        </label>
                                        <textarea 
                                            className="form-control" 
                                            id="activities"
                                            name="activities"
                                            rows="3"
                                            value={formData.activities}
                                            onChange={handleInputChange}
                                            
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="homework" className="form-label">
                                            <i className="fas fa-home me-2"></i>Homework Assigned
                                        </label>
                                        <textarea 
                                            className="form-control" 
                                            id="homework"
                                            name="homework"
                                            rows="3"
                                            value={formData.homework}
                                            onChange={handleInputChange}
                                            
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="additional_notes" className="form-label">
                                            <i className="fas fa-sticky-note me-2"></i>Additional Notes
                                        </label>
                                        <textarea 
                                            className="form-control" 
                                            id="additional_notes"
                                            name="additional_notes"
                                            rows="3"
                                            value={formData.additional_notes}
                                            onChange={handleInputChange}
                                            
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={resetForm}
                                        
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={formData.learning_outcomes.length === 0}
                                    >
                                        {isLoading ? (
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                            <i className="fas fa-save me-1"></i>
                                        )}
                                        Save Diary Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageDiaries;