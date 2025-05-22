import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Select from 'react-select';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import { 
  fetchEducationTypes, 
  fetchLevelTypes, 
  fetchSectionTypes, 
  fetchClassTypes,
  fetchCurriculaList 
} from './AppFunctions';
import { getCurrentUser } from './AuthUser';

const API_BASE_URL = 'http://localhost:5000';

const initialFormState = {
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
};

const ManageCurricula = () => {
  const user = getCurrentUser();
  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [isLoading, setIsLoading] = useState({
    educationTypes: false,
    levels: false,
    sections: false,
    classes: false,
    submitting: false,
    fetching: false
  });
  const [curricula, setCurricula] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [inputMethod, setInputMethod] = useState('');
  const [courseStructure, setCourseStructure] = useState([]);
  const [currentChapter, setCurrentChapter] = useState('');
  const [currentSubChapter, setCurrentSubChapter] = useState('');
  const [currentUnit, setCurrentUnit] = useState('');

  const [educationTypes, setEducationTypes] = useState([]);
  const [levelTypes, setLevelTypes] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [classTypes, setClassTypes] = useState([]);

  const curriculaPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    if (!user) return;

    const initializeData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, fetching: true }));
        const [eduTypes, curriculaData] = await Promise.all([
          fetchEducationTypes(user?.role === "School" ? user.userid : ""),
          fetchCurriculaList(user.userid, user.role)
        ]);

        setEducationTypes(eduTypes.map(({ code, name }) => ({ value: code, label: name })));
        if (curriculaData) setCurricula(curriculaData);
      } catch (error) {
        setNotification({ message: error.message, type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, fetching: false }));
      }
    };

    initializeData();
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
      } catch (error) {
        setNotification({ message: 'Failed to fetch level types:'+error, type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, levels: false }));
      }
    };

    fetchLevels();
  }, [formData.education_type, user]);

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
      } catch (error) {
        setNotification({ message: 'Failed to fetch section types:'+error, type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, sections: false }));
      }
    };

    fetchSections();
  }, [formData.level, user]);

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
        const classArray = typeof cl === 'string' 
          ? cl.split(',').map(c => c.trim()).filter(c => c)
          : Array.isArray(cl)
            ? cl.map(c => String(c).trim()).filter(c => c)
            : [];
            
        setClassTypes(classArray.map(item => ({ value: item, label: item })));
        setFormData(prev => ({ ...prev, class: "" }));
      } catch (error) {
        setNotification({ message: 'Failed to fetch class types:'+error, type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, classes: false }));
      }
    };

    fetchClasses();
  }, [formData.section, formData.level]);

  const filteredCurricula = useMemo(() => {
    if (!Array.isArray(curricula)) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return curricula.filter(curriculum => {
      const name = curriculum?.name?.toLowerCase() || '';
      const code = curriculum?.curriculum_code?.toLowerCase() || '';
      const eduType = curriculum?.education_name?.toLowerCase() || '';
      const level = curriculum?.level_name?.toLowerCase() || '';
      const section = curriculum?.section_name?.toLowerCase() || '';
      
      return (
        name.includes(searchLower) ||
        code.includes(searchLower) ||
        eduType.includes(searchLower) ||
        level.includes(searchLower) ||
        section.includes(searchLower)
      );
    });
  }, [curricula, searchTerm]);

  const paginatedCurricula = useMemo(() => {
    const startIndex = (currentPage - 1) * curriculaPerPage;
    return filteredCurricula.slice(startIndex, startIndex + curriculaPerPage);
  }, [filteredCurricula, currentPage]);

  const totalPages = Math.ceil(filteredCurricula.length / curriculaPerPage);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, document: e.target.files[0] }));
  }, []);

  const addChapter = useCallback(() => {
    if (!currentChapter.trim()) return;
    setCourseStructure(prev => [...prev, {
      name: currentChapter,
      subChapters: []
    }]);
    setCurrentChapter("");
  }, [currentChapter]);

  const addSubChapter = useCallback((chapterIndex) => {
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
  }, [currentSubChapter]);

  const addUnit = useCallback((chapterIndex, subChapterIndex) => {
    if (!currentUnit.trim()) return;
    setCourseStructure(prev => {
      const updated = [...prev];
      updated[chapterIndex].subChapters[subChapterIndex].units.push(currentUnit);
      return updated;
    });
    setCurrentUnit("");
  }, [currentUnit]);

  const removeItem = useCallback((type, chapterIndex, subChapterIndex, unitIndex) => {
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
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name) {
      setNotification({ message: 'Curriculum name is required', type: 'error' });
      return false;
    }
    if (!formData.code) {
      setNotification({ message: 'Curriculum code is required', type: 'error' });
      return false;
    }
    if (!formData.education_type) {
      setNotification({ message: 'Education type is required', type: 'error' });
      return false;
    }
    if (!formData.level) {
      setNotification({ message: 'Education level is required', type: 'error' });
      return false;
    }
    if (!formData.class) {
      setNotification({ message: 'Class is required', type: 'error' });
      return false;
    }
    if (!formData.document) {
      setNotification({ message: 'Document is required', type: 'error' });
      return false;
    }
    if (inputMethod === "Manual" && courseStructure.length === 0) {
      setNotification({ message: 'Please define course structure', type: 'error' });
      return false;
    }
    return true;
  }, [formData, inputMethod, courseStructure]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(prev => ({ ...prev, submitting: true }));
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
      formValues.append("document", formData.document);

      if (inputMethod === "Manual") {
        formValues.append("structure", JSON.stringify(courseStructure));
      }

      const response = await axios.post(
        `${API_BASE_URL}/curriculum/addCurriculum`, 
        formValues, 
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`
          } 
        }
      );

      if (response.data.type === "success") {
        setNotification({ message: response.data.message, type: "success" });
        const updatedCurricula = await fetchCurriculaList(user.userid, user.role);
        setCurricula(updatedCurricula || []);
        setFormData(initialFormState);
        setCourseStructure([]);
        setShowModal(false);
        setShowStructureModal(false);
      } else {
        setNotification({ message: response.data.error, type: "error" });
      }
    } catch (error) {
      setNotification({ 
        message: error.response?.data?.message || "Failed to add curriculum", 
        type: "error" 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [formData, inputMethod, courseStructure, user, validateForm]);

  const handleDeleteCurriculum = useCallback(async (curriculumId) => {
    if (window.confirm('Are you sure you want to delete this curriculum?')) {
      try {
        setIsLoading(prev => ({ ...prev, fetching: true }));
        const response = await axios.delete(
          `${API_BASE_URL}/curriculum/deleteCurriculum/${curriculumId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (response.data.type === 'success') {
          setNotification({ message: response.data.message, type: 'success' });
          const updatedCurricula = await fetchCurriculaList(user.userid, user.role);
          setCurricula(updatedCurricula || []);
        } else {
          setNotification({ message: response.data.error, type: 'error' });
        }
      } catch (error) {
        setNotification({ message: `Error deleting curriculum: ${error.message}`, type: 'error' });
      } finally {
        setIsLoading(prev => ({ ...prev, fetching: false }));
      }
    }
  }, [user]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setCourseStructure([]);
    setInputMethod('');
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    switch(user.role) {
      case 'Administrator':
        return 'Manage Curricula';
      case 'School':
        return 'School Curricula';
      case 'Teacher':
        return 'Curriculum Directory';
      default:
        return 'Curriculum Management';
    }
  };

  return (
    <>
      {notification.message && (
        <ToastMessage 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: null, type: null })}
        />
      )}
      
      <Sidebar />
      
      <div className="page-content">
        <div id="curricula-page" className="page">
          <div className="page-header">
            <h1 className="h2">{getPageTitle()}</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              disabled={isLoading.fetching}
            >
              <i className="fas fa-plus me-2"></i> Add New Curriculum
            </button>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Curriculum List</h5>
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
              {isLoading.fetching ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Duration</th>
                          <th>Education Type</th>
                          <th>Education Level</th>
                          <th>Section/Option</th>
                          <th>Class</th>
                          <th>Issued On</th>
                          <th>Document</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCurricula.length > 0 ? (
                          paginatedCurricula.map((curriculum) => (
                            <tr key={curriculum._id}>
                              <td>{curriculum.curriculum_code}</td>
                              <td>{curriculum.name}</td>
                              <td>{curriculum.duration} hours</td>
                              <td>{curriculum.education_name}</td>
                              <td>{curriculum.level_name}</td>
                              <td>{curriculum.section_name}</td>
                              <td>{curriculum.class_type_code}</td>
                              <td>{new Date(curriculum.issued_on).toLocaleDateString()}</td>
                              <td>
                                <a 
                                  href={`${API_BASE_URL}${curriculum.document_path}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="fas fa-download me-2"></i>PDF
                                </a>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCurriculum(curriculum._id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="text-center">
                              No curricula found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {totalPages > 1 && (
                    <nav>
                      <ul className="pagination justify-content-end">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)}
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
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Curriculum Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-black text-white">
              <h5 className="modal-title">Add New Curriculum</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => { setShowModal(false); resetForm(); }}
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
                        placeholder="Curriculum Title"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading.submitting}
                      />
                      <label>
                        <i className="fas fa-book me-2"></i>Curriculum Title
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        name="code"
                        className="form-control"
                        placeholder="Curriculum Code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading.submitting}
                      />
                      <label>
                        <i className="fas fa-code me-2"></i>Curriculum Code
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
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fas fa-th-large me-2"></i>Education Section
                    </label>
                    <Select
                      isClearable
                      options={sectionTypes}
                      isLoading={isLoading.sections}
                      onChange={(selected) => handleSelectChange("section", selected)}
                      value={sectionTypes.find(opt => opt.value === formData.section)}
                      placeholder={formData.level ? "Select Section" : "Select Level first"}
                      isDisabled={!formData.level || isLoading.submitting}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fas fa-chalkboard me-2"></i>Class/Promotion
                    </label>
                    <Select
                      isClearable
                      options={classTypes}
                      isLoading={isLoading.classes}
                      onChange={(selected) => handleSelectChange("class", selected)}
                      value={classTypes.find(opt => opt.value === formData.class)}
                      placeholder={formData.section ? "Select Class" : "Select Section first"}
                      isDisabled={!formData.section || isLoading.submitting}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="number"
                        name="duration"
                        className="form-control"
                        placeholder="Duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="1"
                        required
                        disabled={isLoading.submitting}
                      />
                      <label>
                        <i className="fas fa-clock me-2"></i>Duration (weeks)
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="date"
                        name="issued_on"
                        className="form-control"
                        placeholder="Issued On"
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
                </div>

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
                      <i className="fas fa-info-circle me-2"></i>Description
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="card">
                    <div className="card-header">
                      <h6>Curriculum Structure Input Method</h6>
                    </div>
                    <div className="card-body">
                      <div className="form-check">
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
                          Extract structure from document
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="inputMethod"
                          id="manualInput"
                          value="Manual"
                          checked={inputMethod === "Manual"}
                          onChange={() => setInputMethod("Manual")}
                          disabled={isLoading.submitting}
                        />
                        <label className="form-check-label" htmlFor="manualInput">
                          Define structure manually
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {inputMethod === "Manual" && (
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setShowStructureModal(true)}
                      disabled={isLoading.submitting}
                    >
                      <i className="fas fa-edit me-2"></i>Define Curriculum Structure
                    </button>
                    {courseStructure.length > 0 && (
                      <div className="alert alert-info mt-2">
                        <strong>Structure Preview:</strong> {courseStructure.length} chapters defined
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-file-pdf me-2"></i>Upload Curriculum Document (PDF)
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
                    onClick={() => { setShowModal(false); resetForm(); }}
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
                    ) : 'Save Curriculum'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Structure Modal */}
      {showStructureModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Define Curriculum Structure</h5>
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