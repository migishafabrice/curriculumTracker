import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Select from "react-select";
import axios from "axios";
import ToastMessage from "../ToastMessage";

const ManageCurricula = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    education_type: "",
    level: "",
    duration:0,
    option: "",
    class: "",
    code:"",
    description: "",
    issued_on: "",
    document: null
  });
  const [hasSection, setHasSection] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // State for dropdown options
  const [educationTypes, setEducationTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [options, setOptions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState({
    educationTypes: false,
    levels: false,
    options: false,
    classes: false
  });
 const [CourseModal,showCourseModal]=useState(false);
  // State for Course structure
  const [CourseStructure, setCourseStructure] = useState([]);
  const [currentChapter, setCurrentChapter] = useState("");
  const [currentSubChapter, setCurrentSubChapter] = useState("");
  const [currentUnit, setCurrentUnit] = useState("");
  const [inputMethod, setInputMethod] = useState("");
  const [showStructureModal, setShowStructureModal] = useState(false);

  useEffect(() => {
    fetchEducationTypes();
  }, []);

  const fetchEducationTypes = async () => {
    setIsLoading(prev => ({ ...prev, educationTypes: true }));
    try {
      const response = await axios.get("http://localhost:5000/department/education-types");
      setEducationTypes(response.data.educationTypes.map(item => ({
        value: item.code,
        label: item.name
      })));
    } catch (error) {
      console.error("Error fetching education types:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, educationTypes: false }));
    }
  };

  const fetchLevels = async (educationTypeId) => {
    if (!educationTypeId) return;
    
    setIsLoading(prev => ({ ...prev, levels: true }));
    try {
      const response = await axios.get(
        `http://localhost:5000/department/level-types?education_type_code=${educationTypeId}`
      );
      setLevels(response.data.levelTypes.map(item => ({
        value: item.code,
        label: item.name
      })));
      setOptions([]);
      setClasses([]);
      setFormData(prev => ({
        ...prev,
        level: "",
        option: "",
        class: ""
      }));
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, levels: false }));
    }
  };

  const fetchOptions = async (levelId) => {
    if (!levelId) return;
    
    setIsLoading(prev => ({ ...prev, options: true }));
    try {
      const response = await axios.get(`http://localhost:5000/department/section-types?level_type_code=${levelId}`);
      if (response.data.message === "YES") {
        setHasSection(true);
        setOptions(response.data.sectionTypes.map(item => ({
          value: item.code,
          label: item.name
        })));
      } else {
        setHasSection(false);
      }
      setClasses([]);
      const allClasses = response.data.sectionTypes.flatMap(item => 
        item.classes 
          ? item.classes.split(',').map(c => c.trim())
          : []
      );
      await fetchClasses(allClasses);
      
      setFormData(prev => ({
        ...prev,
        option: "",
        class: ""
      }));
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, options: false }));
    }
  };

  const fetchClasses = async (allClasses) => {
    if (!allClasses) return;
    
    setIsLoading(prev => ({ ...prev, classes: true }));
    try {
      const classArray = typeof allClasses === 'string' 
        ? allClasses.split(',').map(c => c.trim()).filter(c => c)
        : Array.isArray(allClasses)
          ? allClasses.map(c => String(c).trim()).filter(c => c)
          : [];
      setClasses(classArray.map(classe => ({
        value: classe,
        label: classe
      })));
      setFormData(prev => ({
        ...prev,
        class: ""
      }));
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value} = e.target;
   
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
   
};

  const handleSelectChange = async (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "education_type") {
      fetchLevels(value);
    } 
    if (name === "level") {
      fetchOptions(value);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      document: e.target.files[0]
    }));
  };

  const addChapter = () => {
    if (!currentChapter.trim()) return;
    const newChapter = {
      name: currentChapter,
      subChapters: []
    };
    setCourseStructure([...CourseStructure, newChapter]);
    setCurrentChapter("");
  };

  const addSubChapter = (chapterIndex) => {
    if (!currentSubChapter.trim()) return;
    const updatedStructure = [...CourseStructure];
    updatedStructure[chapterIndex].subChapters.push({
      name: currentSubChapter,
      units: []
    });
    setCourseStructure(updatedStructure);
    setCurrentSubChapter("");
  };

  const addUnit = (chapterIndex, subChapterIndex) => {
    if (!currentUnit.trim()) return;
    const updatedStructure = [...CourseStructure];
    updatedStructure[chapterIndex].subChapters[subChapterIndex].units.push(currentUnit);
    setCourseStructure(updatedStructure);
    setCurrentUnit("");
  };

  const removeItem = (type, chapterIndex, subChapterIndex = null, unitIndex = null) => {
    const updatedStructure = [...CourseStructure];
    
    if (type === "chapter") {
      updatedStructure.splice(chapterIndex, 1);
    } else if (type === "subChapter") {
      updatedStructure[chapterIndex].subChapters.splice(subChapterIndex, 1);
    } else if (type === "unit") {
      updatedStructure[chapterIndex].subChapters[subChapterIndex].units.splice(unitIndex, 1);
    }
    
    setCourseStructure(updatedStructure);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formValues = new FormData();
      formValues.append("name", formData.name);
      formValues.append("education_type", formData.education_type);
      formValues.append("level_type", formData.level);
      formValues.append("section_type", formData.option);
      formValues.append("duration", formData.duration);
      formValues.append("code", formData.code);
      formValues.append("class_type", formData.class);
      formValues.append("description", formData.description);
      formValues.append("issued_on", formData.issued_on);
      formValues.append("inputMethod",inputMethod);
      if (inputMethod === "Manual") {
        formValues.append("structure", JSON.stringify(CourseStructure));
      }
      if (!formData.document) {
        setNotification({message:"Course file not uploaded & it must be type PDF",type:"error"})
        return;
      }
      formValues.append("document", formData.document);
      
      const response = await axios.post("http://localhost:5000/Course/addCourse", formValues, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    
      if (response.data.type === "success") {
        setNotification({ message: response.data.message, type: response.data.type });
        setCourseStructure([]);
        setShowStructureModal(false);
      }      
      showCourseModal(false);
    } catch (error) {
      console.error("Error creating Course:", error);
      setNotification({ message: "Failed to add the Course" + error, type: "error" });
    }
  };

  return (
    <>
      {notification.message && <ToastMessage message={notification.message} type={notification.type} />}
      <Sidebar />
      <div className="page-content">
        <div id="Course-page" className="page">
          <div className="page-header">
            <h1 className="h2">Course Management</h1>
            <div>
              <button className="btn btn-primary" onClick={()=>showCourseModal(true)}>
                <i className="fas fa-plus"></i> Add New Course
              </button>
            </div>
          </div>

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
                        <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                        <button className="btn btn-sm btn-outline-info"><i className="fas fa-eye"></i></button>
                        <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <nav>
                <ul className="pagination justify-content-end">
                  <li className="page-item disabled"><a className="page-link" href="#">Previous</a></li>
                  <li className="page-item active"><a className="page-link" href="#">1</a></li>
                  <li className="page-item"><a className="page-link" href="#">2</a></li>
                  <li className="page-item"><a className="page-link" href="#">Next</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {CourseModal && (
      <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Add New Course</h5>
              <button type="button" className="btn-close btn-close-white" onClick={()=>showCourseModal(false)}></button>
            </div>
            <div className="modal-body">
              <form id="CourseForm" onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        id="CourseTitle"
                        placeholder="Course Title"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="CourseTitle">
                        <i className="fas fa-book me-2"></i>Course Title
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                  <label htmlFor="CourseCategory">
                        <i className="fas fa-tags me-2"></i>Education Type
                      </label>
                    <div className="form-floating mb-3">
                      <Select
                        id="CourseCategory"
                        isClearable={true}
                        options={educationTypes}
                        isLoading={isLoading.educationTypes}
                        onChange={(selected) => handleSelectChange("education_type", selected)}
                        placeholder="Select Education Type"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className={hasSection ? "col-md-6" : "col-md-12"}>
                  <label htmlFor="CourseTitle">
                        <i className="fas fa-level-up-alt me-2"></i>Education Level
                      </label>
                    <div className="form-floating mb-3">
                      <Select
                        id="CourseGrade"
                        isClearable={true}
                        options={levels}
                        isLoading={isLoading.levels}
                        onChange={(selected) => handleSelectChange("level", selected)}
                        placeholder="Select Category"
                        value={levels.find(opt => opt.value === formData.level)}
                        required
                      />
                    </div>
                  </div>
                  {hasSection && (
                    <div className="col-md-6">
                       <label htmlFor="CourseSection">
                        <i className="fas fa-th-large me-2"></i>Education Option
                      </label>
                      <div className="form-floating mb-3">
                        <Select
                          id="CourseSection"
                          isClearable={true}
                          options={options}
                          isLoading={isLoading.options}
                          onChange={(selected) => handleSelectChange("option", selected)}
                          placeholder="Select Option"
                          value={options.find(opt => opt.value === formData.option)}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="row mb-3">
                <div className="col-md-4">
                  
                    <div className="form-floating mb-3">
                      <input
                        id="CourseCode"
                        className="form-control"
                        onChange={handleInputChange}
                        placeholder="Course code"
                        value={formData.code}
                        required
                      />
                      <label htmlFor="CourseSection">
                        <i className="fas fa-chalkboard me-2"></i>Course Code
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                  <label htmlFor="CourseSection">
                        <i className="fas fa-chalkboard me-2"></i>Promotion / Level
                      </label>
                    <div className="form-floating mb-3">
                      <Select
                        id="CourseClass"
                        isClearable={true}
                        options={classes}
                        isLoading={isLoading.classes}
                        onChange={(selected) => handleSelectChange("class", selected)}
                        placeholder="Select Class / Promotion"
                        value={classes.find(opt => opt.value === formData.class)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-floating mb-3">
                      <input
                      type="number"
                      name="duration"
                      className="form-control"
                        id="CourseDuration"
                        onChange={handleInputChange}
                        placeholder="Duration"
                        value={formData.duration}
                      />
                     <label htmlFor="CourseDuration">
                      <i className="fas fa-clock me-2"></i>Duration `Empty for whole year or number`
                    </label>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-header">
                        <h6>Course - Curriculum Structure Input Method</h6>
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
                          />
                          <label className="form-check-label" htmlFor="ManualInput">
                            Manual Input
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {inputMethod === "Manual" && (
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowStructureModal(true)}
                      >
                        <i className="fas fa-edit me-2"></i>Define Course Structure
                      </button>
                      {CourseStructure.length > 0 && (
                        <div className="mt-3">
                          <h6>Current Structure Preview:</h6>
                          <div className="border p-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {CourseStructure.map((chapter, chapterIndex) => (
                              <div key={chapterIndex} className="mb-2">
                                <strong>Chapter {chapterIndex + 1}: {chapter.name}</strong>
                                {chapter.subChapters.map((subChapter, subChapterIndex) => (
                                  <div key={subChapterIndex} className="ms-3">
                                    <em>Sub-Chapter {subChapterIndex + 1}: {subChapter.name}</em>
                                    {subChapter.units.map((unit, unitIndex) => (
                                      <div key={unitIndex} className="ms-3">
                                        - Unit {unitIndex + 1}: {unit}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      id="CourseDescription"
                      style={{ height: "100px" }}
                      placeholder="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="CourseDescription">
                      <i className="fas fa-info-circle me-2"></i>Course Description
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-floating">
                    <input type="date"
                      className="form-control"
                      id="CourseIssuedOn"
                      placeholder="Issued on"
                      name="issued_on"
                      value={formData.issued_on}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="CourseIssuedOn">
                      <i className="fas fa-calendar me-2"></i>Issued On
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="CourseDocument" className="form-label">
                    <i className="fas fa-file-upload me-2"></i>Upload Course -Curriculum Document
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    id="CourseDocument"
                    onChange={handleFileChange}
                   name="document"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      )}
      {/* Structure Modal */}
      {showStructureModal && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Define Course Structure</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowStructureModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6>Add Chapter</h6>
                      </div>
                      <div className="card-body">
                        <div className="input-group mb-3">
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

                <div className="mt-4">
                  <h5>Course Structure</h5>
                  {CourseStructure.length === 0 ? (
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
                          {CourseStructure.map((chapter, chapterIndex) => (
                            <React.Fragment key={chapterIndex}>
                              <tr>
                                <td rowSpan={chapter.subChapters.length > 0 ? chapter.subChapters.length + 1 : 2}>
                                  {chapter.name}
                                  <button
                                    className="btn btn-sm btn-danger float-end"
                                    onClick={() => removeItem("chapter", chapterIndex)}
                                  >
                                    Remove Chapter
                                  </button>
                                </td>
                                {chapter.subChapters.length === 0 && (
                                  <td colSpan="3">
                                    <em>No sub-chapters yet</em>
                                  </td>
                                )}
                              </tr>
                              {chapter.subChapters.map((subChapter, subChapterIndex) => (
                                <tr key={`${chapterIndex}-${subChapterIndex}`}>
                                  <td>
                                    {subChapter.name}
                                    <button
                                      className="btn btn-sm btn-danger float-end"
                                      onClick={() => removeItem("subChapter", chapterIndex, subChapterIndex)}
                                    >
                                      Remove
                                    </button>
                                  </td>
                                  <td>
                                    {subChapter.units.length > 0 ? (
                                      <ul className="list-unstyled">
                                        {subChapter.units.map((unit, unitIndex) => (
                                          <li key={unitIndex}>
                                            {unit}
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
                                    <div className="input-group mb-2">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Add unit"
                                        value={currentUnit}
                                        onChange={(e) => setCurrentUnit(e.target.value)}
                                      />
                                      <button
                                        className="btn btn-sm btn-primary"
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