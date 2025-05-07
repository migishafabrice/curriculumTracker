import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Select from "react-select";
import axios from "axios";
import ToastMessage from "../ToastMessage";
import { fetchEducationTypes, fetchLevelTypes, fetchSectionTypes, fetchClassTypes } from "./AppFunctions";
import { getCurrentUser } from "./AuthUser";
import { Navigate, replace } from "react-router-dom";
const ManageCurricula = () => {
  const user = getCurrentUser();
  if(!user) {
   console.error("User not found");
   Navigate("/login",replace);
  }
  const [formData, setFormData] = useState({
    name: "",
    education_type: "",
    level: "",
    duration: 0,
    section: "",
    class: "",
    code: "",
    description: "",
    issued_on: "",
    document: null
  });

  // UI state
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

  // Dropdown options state
  const [educationTypes, setEducationTypes] = useState([]);
  const [levelTypes, setLevelTypes] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [classTypes, setClassTypes] = useState([]);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    educationTypes: false,
    levels: false,
    sections: false,
    classes: false,
    submitting: false
  });

  // Course structure state
  const [courseStructure, setCourseStructure] = useState([]);
  const [currentChapter, setCurrentChapter] = useState("");
  const [currentSubChapter, setCurrentSubChapter] = useState("");
  const [currentUnit, setCurrentUnit] = useState("");
  const [inputMethod, setInputMethod] = useState("");

  // Fetch education types on mount
  useEffect(() => {
    const loadEducationTypes = async () => {
      setIsLoading(prev => ({ ...prev, educationTypes: true }));
      try {
        const types = await fetchEducationTypes(user?.role === "School" ? user.userid : "");
        setEducationTypes(types.map(({ code, name }) => ({ value: code, label: name })));
      } catch (err) {
        setNotification({ message: 'Failed to fetch education types', type: 'error' });
        console.error("Failed to fetch education types:", err);
      } finally {
        setIsLoading(prev => ({ ...prev, educationTypes: false }));
      }
    };

    loadEducationTypes();
  }, []);

  // Fetch levels when education type changes
  useEffect(() => {
    const fetchLevels = async () => {
      if (!formData.education_type) {
        setLevelTypes([]);
        setSectionTypes([]);
        setClassTypes([]);
        setFormData(prev => ({ ...prev, level: "", section: "", class: "" }));
        return;
      }

      setIsLoading(prev => ({ ...prev, levels: true }));
      try {
        const levels = await fetchLevelTypes(formData.education_type, user?.role === "School" ? user.userid : "");
        setLevelTypes(levels.map(({ code, name }) => ({ value: code, label: name })));
        setFormData(prev => ({ ...prev, level: "", section: "", class: "" }));
      } catch (err) {
        setNotification({ message: 'Failed to fetch level types', type: 'error' });
        console.error("Failed to fetch level types:", err);
      } finally {
        setIsLoading(prev => ({ ...prev, levels: false }));
      }
    };

    fetchLevels();
  }, [formData.education_type]);

  // Fetch sections when level changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!formData.level) {
        setSectionTypes([]);
        setClassTypes([]);
        setFormData(prev => ({ ...prev, section: "", class: "" }));
        return;
      }

      setIsLoading(prev => ({ ...prev, sections: true }));
      try {
        const sections = await fetchSectionTypes(formData.level, user?.role === "School" ? user.userid : "");
        setSectionTypes(sections.map(({ code, name }) => ({ value: code, label: name })));
        setFormData(prev => ({ ...prev, section: "", class: "" }));
      } catch (err) {
        setNotification({ message: 'Failed to fetch section types', type: 'error' });
        console.error("Failed to fetch section types:", err);
      } finally {
        setIsLoading(prev => ({ ...prev, sections: false }));
      }
    };

    fetchSections();
  }, [formData.level]);

  // Fetch classes when section changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!formData.section) {
        setClassTypes([]);
        setFormData(prev => ({ ...prev, class: "" }));
        return;
      }

      setIsLoading(prev => ({ ...prev, classes: true }));
      try {
        const cl = await fetchClassTypes(formData.level);
        const allClasses = cl.flatMap(item => 
          item.classes 
            ? item.classes.split(',').map(c => c.trim())
            : []
        );
        
        const classArray = typeof allClasses === 'string' 
          ? allClasses.split(',').map(c => c.trim()).filter(c => c)
          : Array.isArray(allClasses)
            ? allClasses.map(c => String(c).trim()).filter(c => c)
            : [];
            
        setClassTypes(classArray.map(item => ({ value: item, label: item })));
        setFormData(prev => ({ ...prev, class: "" }));
      } catch (err) {
        setNotification({ message: 'Failed to fetch class types', type: 'error' });
        console.error("Failed to fetch class types:", err);
      } finally {
        setIsLoading(prev => ({ ...prev, classes: false }));
      }
    };

    fetchClasses();
  }, [formData.section, formData.level]);

  // Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, document: e.target.files[0] }));
  };

  // Course structure management
  const addChapter = () => {
    if (!currentChapter.trim()) return;
    setCourseStructure(prev => [...prev, {
      name: currentChapter,
      subChapters: []
    }]);
    setCurrentChapter("");
  };

  const addSubChapter = (chapterIndex) => {
    if (!currentSubChapter.trim()) return;
    setCourseStructure(prev => {
      const updated = [...prev];
      updated[chapterIndex].subChapters.push({
        name: currentSubChapter,
        units: []
      });
      return updated;
    });
    setCurrentSubChapter("");
  };

  const addUnit = (chapterIndex, subChapterIndex) => {
    if (!currentUnit.trim()) return;
    setCourseStructure(prev => {
      const updated = [...prev];
      updated[chapterIndex].subChapters[subChapterIndex].units.push(currentUnit);
      return updated;
    });
    setCurrentUnit("");
  };

  const removeItem = (type, chapterIndex, subChapterIndex, unitIndex) => {
    setCourseStructure(prev => {
      const updated = [...prev];
      if (type === "chapter") {
        updated.splice(chapterIndex, 1);
      } else if (type === "subChapter") {
        updated[chapterIndex].subChapters.splice(subChapterIndex, 1);
      } else if (type === "unit") {
        updated[chapterIndex].subChapters[subChapterIndex].units.splice(unitIndex, 1);
      }
      return updated;
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, submitting: true }));

    try {
      const formValues = new FormData();
      formValues.append("name", formData.name);
      formValues.append("education_type", formData.education_type);
      formValues.append("level_type", formData.level);
      formValues.append("section_type", formData.section);
      formValues.append("duration", formData.duration);
      formValues.append("code", formData.code);
      formValues.append("class_type", formData.class);
      formValues.append("description", formData.description);
      formValues.append("issued_on", formData.issued_on);
      formValues.append("inputMethod", inputMethod);

      if (inputMethod === "Manual") {
        formValues.append("structure", JSON.stringify(courseStructure));
      }

      if (!formData.document) {
        setNotification({ message: "Course file not uploaded & it must be type PDF", type: "error" });
        return;
      }
      formValues.append("document", formData.document);
      const response = await axios.post("http://localhost:5000/curriculum/addCurriculum", formValues, {
      headers: { "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.token}`
      }
      });

      if (response.data.type === "success") {
        setNotification({ message: response.data.message, type: "success" });
        setCourseStructure([]);
        setShowStructureModal(false);
        setShowCourseModal(false);
        setFormData({
          name: "",
          education_type: "",
          level: "",
          duration: 0,
          section: "",
          class: "",
          code: "",
          description: "",
          issued_on: "",
          document: null
        });
      }
    } catch (error) {
      console.error("Error creating Course:", error);
      setNotification({ 
        message: error.response?.data?.message || "Failed to add the Course", 
        type: "error" 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, submitting: false }));
    }
  };

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
        <div className="page">
          <div className="page-header d-flex justify-content-between align-items-center">
            <h1 className="h2">Course Management</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCourseModal(true)}
              disabled={isLoading.educationTypes}
            >
              <i className="fas fa-plus me-2"></i> Add New Course
            </button>
          </div>

          {/* Course List Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Course List</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Grade</th>
                      <th>Created By</th>
                      <th>Last Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>C001</td>
                      <td>Mathematics</td>
                      <td>Grade 10</td>
                      <td>John Smith</td>
                      <td>Mar 10, 2025</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title">Add New Course Curriculum</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowCourseModal(false)}
                  disabled={isLoading.submitting}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Course Title"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading.submitting}
                        />
                        <label>
                          <i className="fas fa-book me-2"></i>Course Title
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          name="code"
                          className="form-control"
                          placeholder="Course Code"
                          value={formData.code}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading.submitting}
                        />
                        <label>
                          <i className="fas fa-code me-2"></i>Course Code
                        </label>
                      </div>
                    </div>
                    
                  </div>

                  <div className="row mb-3">
                  <div className="col-md-6">
                      <label className="form-label">
                        <i className="fas fa-tags me-2"></i>Education Type
                      </label>
                      <Select
                        isClearable
                        options={educationTypes}
                        isLoading={isLoading.educationTypes}
                        onChange={(selected) => handleSelectChange("education_type", selected)}
                        value={educationTypes.find(opt => opt.value === formData.education_type)}
                        placeholder="Select Education Type"
                        required
                        isDisabled={isLoading.submitting}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="fas fa-level-up-alt me-2"></i>Education Level
                      </label>
                      <Select
                        isClearable
                        options={levelTypes}
                        isLoading={isLoading.levels}
                        onChange={(selected) => handleSelectChange("level", selected)}
                        value={levelTypes.find(opt => opt.value === formData.level)}
                        placeholder={formData.education_type ? "Select Level" : "Select Education Type first"}
                        isDisabled={!formData.education_type || isLoading.submitting}
                        required
                      />
                    </div>
                    
                  </div>

                  <div className="row mb-3">
                  <div className="col-md-4">
                      <label className="form-label">
                        <i className="fas fa-th-large me-2"></i>Education Options - Sections
                      </label>
                      <Select
                        isClearable
                        options={sectionTypes}
                        isLoading={isLoading.sections}
                        onChange={(selected) => handleSelectChange("section", selected)}
                        value={sectionTypes.find(opt => opt.value === formData.section)}
                        placeholder={formData.level ? "Select Option" : "Select Level first"}
                        isDisabled={!formData.level || isLoading.submitting}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">
                        <i className="fas fa-chalkboard me-2"></i>Class/Promotion
                      </label>
                      <Select
                        isClearable
                        options={classTypes}
                        isLoading={isLoading.classes}
                        onChange={(selected) => handleSelectChange("class", selected)}
                        value={classTypes.find(opt => opt.value === formData.class)}
                        placeholder={formData.section ? "Select Class" : "Select Option first"}
                        isDisabled={!formData.section || isLoading.submitting}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                    <label>
                          <i className="fas fa-clock me-2 mb-2"></i>Duration (weeks)
                        </label>
                      
                        <input
                          type="number"
                          name="duration"
                          className="form-control"
                          placeholder="Duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          disabled={isLoading.submitting}
                        />
                        
                     
                    </div>
                  </div>

                  {/* Input Method Selection */}
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-header">
                          <h6>Course Structure Input Method</h6>
                        </div>
                        <div className="card-body">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="inputMethod"
                              id="autoExtract"
                              value="auto"
                              checked={inputMethod === "auto"}
                              onChange={() => setInputMethod("auto")}
                              disabled={isLoading.submitting}
                            />
                            <label className="form-check-label" htmlFor="autoExtract">
                              Extract from Document
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="inputMethod"
                              id="ManualInput"
                              value="Manual"
                              checked={inputMethod === "Manual"}
                              onChange={() => setInputMethod("Manual")}
                              disabled={isLoading.submitting}
                            />
                            <label className="form-check-label" htmlFor="ManualInput">
                              Manual Input
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Structure Input */}
                  {inputMethod === "Manual" && (
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <button
                          type="button"
                          className="btn btn-outline-primary mb-3"
                          onClick={() => setShowStructureModal(true)}
                          disabled={isLoading.submitting}
                        >
                          <i className="fas fa-edit me-2"></i>Define Course Structure
                        </button>
                        {courseStructure.length > 0 && (
                          <div className="alert alert-info">
                            <strong>Structure Preview:</strong> {courseStructure.length} chapters defined
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-3">
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        style={{ height: "100px" }}
                        placeholder="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading.submitting}
                      />
                      <label>
                        <i className="fas fa-info-circle me-2"></i>Course Description
                      </label>
                    </div>
                  </div>

                  {/* Issued Date */}
                  <div className="mb-3">
                    <div className="form-floating">
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Issued on"
                        name="issued_on"
                        value={formData.issued_on}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading.submitting}
                      />
                      <label>
                        <i className="fas fa-calendar me-2"></i>Issued On
                      </label>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-file-upload me-2"></i>Upload Course Document (PDF)
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                      disabled={isLoading.submitting}
                    />
                  </div>

                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowCourseModal(false)}
                      disabled={isLoading.submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading.submitting}
                    >
                      {isLoading.submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : "Save Course"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Structure Modal */}
      {showStructureModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Define Course Structure</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowStructureModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6>Add Chapter</h6>
                      </div>
                      <div className="card-body">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Chapter name"
                            value={currentChapter}
                            onChange={(e) => setCurrentChapter(e.target.value)}
                          />
                          <button 
                            className="btn btn-primary" 
                            onClick={addChapter}
                            disabled={!currentChapter.trim()}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {courseStructure.length === 0 ? (
                  <div className="alert alert-info">
                    No chapters added yet. Start by adding a chapter above.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Chapter</th>
                          <th>Sub-Chapter</th>
                          <th>Units</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseStructure.map((chapter, chapterIndex) => (
                          <React.Fragment key={chapterIndex}>
                            <tr>
                              <td rowSpan={chapter.subChapters.length + 1}>
                                <strong>{chapter.name}</strong>
                                <button
                                  className="btn btn-sm btn-danger float-end"
                                  onClick={() => removeItem("chapter", chapterIndex)}
                                >
                                  <i className="fas fa-trash"></i> Remove
                                </button>
                              </td>
                            </tr>
                            {chapter.subChapters.map((subChapter, subChapterIndex) => (
                              <tr key={`${chapterIndex}-${subChapterIndex}`}>
                                <td>
                                  {subChapter.name}
                                  <button
                                    className="btn btn-sm btn-danger float-end"
                                    onClick={() => removeItem("subChapter", chapterIndex, subChapterIndex)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </td>
                                <td>
                                  {subChapter.units.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                      {subChapter.units.map((unit, unitIndex) => (
                                        <li key={unitIndex} className="d-flex justify-content-between align-items-center">
                                          <span>{unit}</span>
                                          <button
                                            className="btn btn-sm btn-link text-danger"
                                            onClick={() => removeItem("unit", chapterIndex, subChapterIndex, unitIndex)}
                                          >
                                            <i className="fas fa-times"></i>
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <em>No units yet</em>
                                  )}
                                </td>
                                <td>
                                  <div className="input-group input-group-sm mb-2">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Add unit"
                                      value={currentUnit}
                                      onChange={(e) => setCurrentUnit(e.target.value)}
                                    />
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        addUnit(chapterIndex, subChapterIndex);
                                        setCurrentUnit("");
                                      }}
                                      disabled={!currentUnit.trim()}
                                    >
                                      Add
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td colSpan="3">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Add sub-chapter"
                                    value={currentSubChapter}
                                    onChange={(e) => setCurrentSubChapter(e.target.value)}
                                  />
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                      addSubChapter(chapterIndex);
                                      setCurrentSubChapter("");
                                    }}
                                    disabled={!currentSubChapter.trim()}
                                  >
                                    Add
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStructureModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowStructureModal(false)}
                >
                  Save Structure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageCurricula;