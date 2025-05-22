import React, { useEffect, useState, useReducer } from "react";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./AuthUser";
import { fetchCurriculumPerTeacher, fetchCourseSelected } from "./AppFunctions";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import ToastMessage from "../ToastMessage";
import axios from "axios";

// Initial state and reducer for form management
const initialFormState = {
  course_code: "",
  teacher_code: "",
  date: new Date().toISOString().split('T')[0],
  activities: "",
  homework: "",
  additional_notes: "",
  status: false,
  learning_outcomes: [],
  period: "",
  observation: ""
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_LEARNING_OUTCOME':
      return {
        ...state,
        learning_outcomes: [...state.learning_outcomes, action.outcome],
      };
    case 'REMOVE_LEARNING_OUTCOME':
      return {
        ...state,
        learning_outcomes: state.learning_outcomes.filter((_, i) => i !== action.index)
      };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
};

const ManageDiaries = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [modal,setModal]=useState(false);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      dispatch({ type: 'UPDATE_FIELD', field: 'teacher_code', value: user.userid });
    }
  }, []);

  // Fetch courses and diary entries
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, diariesData] = await Promise.all([
          fetchCurriculumPerTeacher(user.userid,user.role),
          fetchDiaryEntries()
        ]);

        setCourses(coursesData.map(course => ({
          value: course.code,
          label: `${course.name} (${course.code})`,
          ...course
        })));
        
        setDiaryEntries(diariesData);
        setIsLoading(false);
      } catch (error) {
        setNotification({ message: "Error fetching data: " + error.message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
    setIsLoading(false);
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

  const fetchDiaryEntries = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/diary/get-diary-entries",
        { teacher_code: user.userid },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      return response.data.diaries || [];
    } catch (error) {
      setNotification({ message: "Error fetching diary entries:"+error, type: "error" });
      return [];
    }
  };

  const handleSelectCourse = async (selected) => {
    const selectedValue = selected?.value || null;
    
    dispatch({ type: 'UPDATE_FIELD', field: 'course_code', value: selectedValue });
    
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
      setIsLoading(false);
    } catch (error) {
      setNotification({ message: "Error loading course details: " + error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearningOutcomeChange = (selected) => {
    setCurrentLO(selected?.value || "");
    setTopicsOptions(selected ? selected.content.map(topic => ({
      value: topic,
      label: topic
    })) : []);
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

    dispatch({ type: 'ADD_LEARNING_OUTCOME', outcome: newLO });
    setCurrentLO("");
    setCurrentTopics([]);
    setTopicsOptions([]);
  };

  const removeLearningOutcome = (index) => {
    dispatch({ type: 'REMOVE_LEARNING_OUTCOME', index });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  };

  const handleSelectChange = (selected, field) => {
    dispatch({ type: 'UPDATE_FIELD', field, value: selected ? selected.value : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.learning_outcomes.length === 0) {
      setNotification({ message: "Please add at least one learning outcome", type: "error" });
      return;
    }

    setIsLoading(true);
    
    try {
      const submissionData = {
        ...formData,
        learning_outcomes_json: JSON.stringify(formData.learning_outcomes)
      };

      const response = await axios.post(
        "http://localhost:5000/diary/add-diary-entry",
        submissionData,
        
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.type === "error") {
        throw new Error(response.data.message);
      }
      
      setNotification({ message: "Diary entry saved successfully", type: "success" });
      setDiaryEntries(await fetchDiaryEntries());
      setShowModal(false);
      dispatch({ type: 'RESET' });
    } catch (error) {
      setNotification({ message: error.message || "Error saving diary entry", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this diary entry?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/diary/delete-entry/${entryId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        
        if (response.data.type === "success") {
          setNotification({ message: response.data.message, type: "success" });
          setDiaryEntries(await fetchDiaryEntries());
        }
      } catch (error) {
        setNotification({ message: "Error deleting entry: " + error.message, type: "error" });
      }
    }
  };

  const formatLearningOutcomes = (outcomes) => {
    if (!outcomes) return "N/A";
    
    try {
      const parsed = typeof outcomes === "string" ? JSON.parse(outcomes) : outcomes;
      return (
        <ul className="mb-0">
          {parsed.map((lo, i) => (
            <li key={i}>
              <strong>{lo["Learning Outcome"]}</strong>
              {lo.content && lo.content.length > 0 && (
                <ul>
                  {lo.content.map((topic, j) => (
                    <li key={j}>{topic}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );
    } catch (e) {
      return "Invalid format:"+e;
    }
  };

  // Filter and pagination logic
  const filteredEntries = diaryEntries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.course_name?.toLowerCase().includes(searchLower) ||
      entry.activities?.toLowerCase().includes(searchLower) ||
      entry.homework?.toLowerCase().includes(searchLower) ||
      entry.additional_notes?.toLowerCase().includes(searchLower) ||
      entry.observation?.toLowerCase().includes(searchLower) ||
      new Date(entry.date).toLocaleDateString().includes(searchTerm)
    );
  });

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

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
                                className="btn btn-primary me-2" 
                                onClick={() => setModal(true)}
                            >
                                <i className="fas fa-plus me-1"></i>
                                Course resources & Assessment
                            </button>
            <button 
              className="btn btn-success" 
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-table me-1"></i>
              Add Diary Entry
            </button>
          </div>
           </div>         
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Diary Entries</h5>
              <div className="d-flex justify-content-end align-items-center mt-4 mb-3 pe-3" style={{ width: "60%", marginLeft: "auto" }}>
                <div className="input-group me-2">
                  <span className="input-group-text"><i className="fas fa-search"></i></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="card-body p-1">
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Section | Option</th>
                        <th>Class | Promotion</th>
                        <th>Course</th>
                        <th>Learning Outcomes</th>
                        <th>Activities</th>
                        <th>Homework</th>
                        <th>Period</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEntries.length > 0 ? (
                        paginatedEntries.map(entry => (
                          <tr key={entry.id}>
                            <td>{new Date(entry.date).toLocaleDateString()}</td>
                            <td>{entry.section_name}</td>
                            <td>{entry.class_name}</td>
                            <td>{entry.course_name || "N/A"}</td>
                            <td>{formatLearningOutcomes(entry.learningoutcome)}</td>
                            <td>{entry.activities || "N/A"}</td>
                            <td>{entry.homework || "N/A"}</td>
                            <td>{entry.periods || "N/A"}</td>
                            <td>
                              <span className={`badge ${entry.status ? 'bg-success' : 'bg-warning'}`}>
                                {entry.status ? "Completed" : "Pending"}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => {
                                  // Implement edit functionality
                                }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No diary entries found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-end">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li 
                        key={i + 1} 
                        className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Diary Entry Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title">Add Diary Entry</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowModal(false);
                    dispatch({ type: 'RESET' });
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
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
                    <div className="col-md-6">
                      <label htmlFor="diaryCourse" className="form-label">
                        <i className="fas fa-book me-2"></i>Course
                      </label>
                      <Select
                        id="diaryCourse"
                        options={courses}
                        placeholder="Select a course"
                        isSearchable
                        isClearable
                        onChange={(selected) => handleSelectCourse(selected)}
                        value={courses.find(c => c.value === formData.course_code)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    {/* <div className="col-md-4">
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
                    </div> */}
                    <div className="col-md-6">
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
                    <div className="col-md-6">
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

                  <div className="mb-4">
                    <h5 className="mb-3">
                      <i className="fas fa-list-check me-2"></i>
                      Learning Outcomes
                    </h5>
                    
                    <div className="card mb-3">
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Learning Outcome</label>
                            <Select
                              options={learningOutcomes}
                              placeholder={learningOutcomes.length ? "Select learning outcome" : "Select a course first"}
                              isSearchable
                              isClearable
                              onChange={handleLearningOutcomeChange}
                              value={learningOutcomes.find(lo => lo.value === currentLO)}
                              isDisabled={!learningOutcomes.length}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Topics</label>
                            <Select
                              options={topicsOptions}
                              placeholder={topicsOptions.length ? "Select topics" : "Select learning outcome first"}
                              isSearchable
                              isMulti
                              onChange={handleTopicsCoveredChange}
                              value={currentTopics}
                              isDisabled={!topicsOptions.length}
                            />
                          </div>
                          <div className="col-12">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={addLearningOutcome}
                              disabled={!currentLO || currentTopics.length === 0}
                            >
                              <i className="fas fa-plus me-2"></i>
                              Add Learning Outcome
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

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
                    <label htmlFor="period" className="form-label">
                      <i className="fas fa-clock me-2"></i>Period
                    </label>
                    <Select
                      options={[1,2,3,4,5,6,7,8].map(i => ({ value: i, label: i }))}
                      value={formData.period ? { value: formData.period, label: formData.period } : null}
                      onChange={(selected) => handleSelectChange(selected, "period")}
                      placeholder="Select period"
                      isSearchable
                      isClearable
                    />
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
                    <label htmlFor="observation" className="form-label">
                      <i className="fas fa-eye me-2"></i>Observation
                    </label>
                    <textarea 
                      className="form-control" 
                      id="observation"
                      name="observation"
                      rows="3"
                      value={formData.observation}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowModal(false);
                      dispatch({ type: 'RESET' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={formData.learning_outcomes.length === 0 || isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-1"></span>
                    ) : (
                      <i className="fas fa-save me-1"></i>
                    )}
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {modal && (
               <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-black text-white">
                                <h5 className="modal-title">Course resources & Assessment</h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setModal(false)}
                                   
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-12">
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
                                        
                                    </div>

                                    <div className="row mb-3">
                                        {/* <div className="col-md-4">
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
                                        </div> */}
                                        <div className="col-md-6">
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
                                        <div className="col-md-6">
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
                                                            onChange={(selected) => handleLearningOutcomeChange(selected,false)}
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
                                                            placeholder={topicsOptions.length ? "Select topics" : "Select Learning Outcome first"}
                                                            isSearchable
                                                            isMulti
                                                            onChange={(selected) => handleTopicsCoveredChange(selected,false)}
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
                                        // onClick={resetForm}
                                        
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
                                        Search 
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