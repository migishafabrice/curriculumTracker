import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import Sidebar from './Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import useLoadSchools from './useLoadSchools';
import Address from './Address';
import Select from 'react-select';
import {fetchEducationTypes,fetchLevelTypes,fetchSectionTypes} from './AppFunctions';
import { getCurrentUser } from './AuthUser';
const user = getCurrentUser(); 
const API_BASE_URL = 'http://localhost:5000';
const AVATAR_SIZE = '50px';

const initialFormState = {
  name: '',
  phone: '',
  email: '',
  education_type: '',
  logo: null,
  address: {
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  }
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_ADDRESS':
      return { 
        ...state, 
        address: { ...state.address, [action.field]: action.value } 
      };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
};

const useSchoolSections = () => {
  const [sections, setSections] = useState([]);
  
  const addSection = useCallback((section) => {
    if (!section.level) throw new Error('Level is required');
    setSections(prev => [...prev, { ...section, id: Date.now() }]);
  }, []);
    
  const removeSection = useCallback((id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  }, []);
  
  const groupSections = useCallback((sections) => {
    return sections.reduce((groups, section) => {
      const { education_type, education_type_label, level, level_label, option_label } = section;
      
      if (!groups[education_type]) {
        groups[education_type] = { label: education_type_label, levels: {} };
      }
      
      if (!groups[education_type].levels[level]) {
        groups[education_type].levels[level] = { label: level_label, sections: [] };
      }
      
      groups[education_type].levels[level].sections.push({
        ...section,
        label: option_label || 'General'
      });
      
      return groups;
    }, {});
  }, []);
  
  return {
    sections, 
    addSection, 
    removeSection, 
    groupSections, 
    setSections
  };
};

const ManageSchools = () => {
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [modal, setModal] = useState(false);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [currentSection, setCurrentSection] = useState({ level: '', option: '' });
  const [educationTypes, setEducationTypes] = useState([]);
  const [levelTypes, setLevelTypes] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { schools, notice, loadSchools } = useLoadSchools();
  const { sections, addSection, removeSection, groupSections, setSections } = useSchoolSections();

  const groupedSections = useMemo(() => groupSections(sections), [groupSections, sections]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  }, []);

  const handleFileChange = useCallback((e) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'logo', value: e.target.files[0] });
  }, []);

  const handleSelectChange = useCallback((name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    if (name === 'education_type') {
      dispatch({ type: 'UPDATE_FIELD', field: name, value });
    } else {
      setCurrentSection(prev => {
        const updatedSection = {
          ...prev,
          [name]: value,
          ...(name === 'level' ? { option: '' } : {}),
          ...(name === 'option' ? { option: value } : {})
        };

        return updatedSection;
      });
        
       
      }
      }, []);

  const handleAddressChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_ADDRESS', field, value });
  }, []);

  const fetchLevelTypesMemoized = useCallback(async (educationType) => {
    if (!educationType) return;
    try {
      setIsLoading(true);
      const levels = await fetchLevelTypes(educationType,user?.role === "School" ? user.userid : "");
      setLevelTypes(levels.map(({code, name}) => ({ value: code, label: name })));
    } catch (err) {
      setNotification({ message: 'Failed to fetch level types', type: 'error' });
      console.error("Failed to fetch level types:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSectionTypesMemoized = useCallback(async (level) => {
    if (!level) return;
    try {
      setIsLoading(true);
      const sections = await fetchSectionTypes(level,user?.role === "School" ? user.userid : "");
      setSectionTypes(sections.map(({code, name}) => ({ value: code, label: name })));
    } catch (err) {
      setNotification({ message: 'Failed to fetch section types', type: 'error' });
      console.error("Failed to fetch section types:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (notice?.message) {
      setNotification(notice);
    }
  }, [notice]);
useEffect(() => {
  loadSchools();
}, [loadSchools]);
  useEffect(() => {
    const loadEducationTypes = async () => {
      try {
        setIsLoading(true);
        const types = await fetchEducationTypes(user?.role === "School" ? user.userid : "");
        setEducationTypes(types.map(({code, name}) => ({
          value: code,
          label: name
        })));
      } catch (err) {
        setNotification({ message: 'Failed to fetch education types', type: 'error' });
        console.error("Failed to fetch education types:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEducationTypes();
  }, []);

  useEffect(() => {
    if (formData.education_type) {
      fetchLevelTypesMemoized(formData.education_type);
    }
  }, [formData.education_type, fetchLevelTypesMemoized]);

  useEffect(() => {
    if (currentSection.level) {
      fetchSectionTypesMemoized(currentSection.level);
    }
  }, [currentSection.level, fetchSectionTypesMemoized]);

  const handleAddSection = useCallback(() => {
    if (!currentSection.level) {
      setNotification({ message: 'Please select at least level before adding', type: 'error' });
      return;
    }

    if (!formData.education_type) {
      setNotification({ message: 'Please select education type first', type: 'error' });
      return;
    }

    const sectionExists = sections.some(s => 
      s.level === currentSection.level && s.option === currentSection.option
    );

    if (sectionExists) {
      setNotification({ message: 'This school section already exists', type: 'error' });
      return;
    }

    const educationTypeLabel = educationTypes.find(et => et.value === formData.education_type)?.label || formData.education_type;
    const levelLabel = levelTypes.find(lt => lt.value === currentSection.level)?.label || currentSection.level;
    const optionLabel = sectionTypes?.find(st => st.value === currentSection.option)?.label || currentSection.option || 'General';

    addSection({
      ...currentSection,
      education_type: formData.education_type,
      education_type_label: educationTypeLabel,
      level_label: levelLabel,
      option_label: optionLabel
    });

    setCurrentSection({ level: '', option: '' });
  }, [currentSection, educationTypes, formData.education_type, levelTypes, sections, sectionTypes, addSection]);

  const prepareSectionsForApi = useCallback(() => {
    return sections.map(({ education_type, level, option }) => ({
      education_type,
      level,
      option
    }));
  }, [sections]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (!formData.name || !formData.phone || !formData.email || !formData.education_type) {
        setNotification({ message: 'Please fill all required fields', type: 'error' });
        return;
      }

      if (sections.length === 0) {
        setNotification({ message: 'Please add at least one school section', type: 'error' });
        return;
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      data.append('address', [
        formData.address.province,
        formData.address.district,
        formData.address.sector,
        formData.address.cell,
        formData.address.village
      ].join(' - '));
      data.append('sections', JSON.stringify(prepareSectionsForApi()));
      if (formData.logo) data.append('logo', formData.logo);

      const response = await axios.post(`${API_BASE_URL}/school/addSchool`, data, {
        headers: { 
            Authorization: `Bearer ${user.token}`
         },
      });

      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        loadSchools();
        dispatch({ type: 'RESET' });
        setModal(false);
        setSections([]);
      } else {
        setNotification({ message: response.data.error, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, sections, prepareSectionsForApi, loadSchools, setSections]);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET' });
    setSections([]);
    setCurrentSection({ level: '', option: '' });
  }, [setSections]);

  const SchoolTableRow = useCallback(({ school }) => (
    <tr key={school.id}>
      <td>
        <div className="d-flex align-items-center">
          <img 
            src={`${API_BASE_URL}${school.logo}`} 
            alt="School logo" 
            className="avatar rounded-circle"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            onError={(e) => e.target.src = '/default-school-logo.png'}
          />
          <div className="ms-3">
            <div className="fw-bold">{school.name}</div>
          </div>
        </div>
      </td>
      <td>{school.telephone}</td>
      <td>{school.email}</td>
      <td>{school.address}</td>
      <td>{school.section_types}</td>
      <td>
        <span className={`badge ${school.active ? 'bg-success' : 'bg-danger'} status-badge`}>
          {school.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <button className="btn btn-sm btn-outline-primary me-2">
          <i className="fas fa-edit"></i>
        </button>
        <button className="btn btn-sm btn-outline-danger">
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  ), []);

  const SectionBadge = useCallback(({ section }) => (
    <span className="badge bg-primary d-inline-flex align-items-center me-2 mb-2">
      {section.label}
      <button 
        type="button" 
        className="btn-close btn-close-white ms-2" 
        onClick={() => removeSection(section.id)}
        aria-label="Remove"
      />
    </span>
  ), [removeSection]);

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
        <div id="Schools-page" className="page">
          <div className="page-header d-flex justify-content-between align-items-center">
            <h1 className="h2">Schools Management</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setModal(true)}
              aria-label="Add new school"
              disabled={isLoading}
            >
              <i className="fas fa-plus me-2"></i> Add New School
            </button>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Schools List</h5>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : schools.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>School</th>
                        <th>Telephone</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Sections</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map(school => (
                        <SchoolTableRow key={school.id} school={school} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No schools found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-black text-white">
                <h5 className="modal-title">Add New School</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => { setModal(false); resetForm(); }}
                  aria-label="Close"
                  disabled={isLoading}
                />
              </div>
              <div className="modal-body">
                <form id="SchoolForm" onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-control"
                          id="SchoolName"
                          placeholder="Name"
                          required
                          disabled={isLoading}
                        />
                        <label htmlFor="SchoolName">
                          <i className="fas fa-user me-2"></i>Name
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-control"
                          id="SchoolPhone"
                          placeholder="Telephone"
                          required
                          disabled={isLoading}
                        />
                        <label htmlFor="SchoolPhone">
                          <i className="fas fa-phone me-2"></i>Phone
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control"
                          id="SchoolEmail"
                          placeholder="Email"
                          required
                          disabled={isLoading}
                        />
                        <label htmlFor="SchoolEmail">
                          <i className="fas fa-envelope me-2"></i>Email
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="CourseCategory" className="form-label">
                        <i className="fas fa-tags me-2"></i>Education Type
                      </label>
                      <Select
                        id="CourseCategory"
                        isClearable
                        options={educationTypes}
                        onChange={(selected) => handleSelectChange("education_type", selected)}
                        value={educationTypes.find(opt => opt.value === formData.education_type)}
                        placeholder="Select Education Type"
                        required
                        isDisabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="mb-4 border-top pt-3">
                    <h5 className="mb-3">School Sections</h5>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="CourseGrade" className="form-label">
                          <i className="fas fa-level-up-alt me-2"></i>Education Level
                        </label>
                        <Select
                          id="CourseGrade"
                          isClearable
                          options={levelTypes}
                          onChange={(selected) => handleSelectChange("level", selected)}
                          value={levelTypes.find(opt => opt.value === currentSection.level)}
                          placeholder="Select Level"
                          isDisabled={isLoading || !formData.education_type}
                        />
                      </div>
                     
                      <div className="col-md-6">
                        <label htmlFor="CourseSection" className="form-label">
                          <i className="fas fa-th-large me-2"></i>Education Option
                        </label>
                        <Select
                          id="CourseSection"
                          isClearable
                          options={sectionTypes}
                          onChange={(selected) => handleSelectChange("option", selected)}
                          value={sectionTypes.find(opt => opt.value === currentSection.option)}
                          placeholder="Select Option"
                          isDisabled={isLoading || !currentSection.level}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleAddSection}
                        disabled={!currentSection.level || !formData.education_type || isLoading}
                      >
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="fas fa-plus me-2"></i>
                        )}
                        Add to School Sections
                      </button>
                    </div>

                    {sections.length > 0 && (
                      <div className="mt-4">
                        <h6>Selected School Sections</h6>
                        <div className="d-flex flex-wrap">
                          {Object.entries(groupedSections).map(([eduType, eduTypeData]) => (
                            <div key={eduType} className="w-100 mb-3">
                              <h6 className="bg-light p-2 rounded">{eduTypeData.label}</h6>
                              {Object.entries(eduTypeData.levels).map(([level, levelData]) => (
                                <div key={level} className="ms-3 mb-3">
                                  <h6 className="text-muted">{levelData.label}</h6>
                                  <div className="d-flex flex-wrap ms-3">
                                    {levelData.sections.map(section => (
                                      <SectionBadge key={section.id} section={section} />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Address
                    address={formData.address}
                    onChange={handleAddressChange}
                    disabled={isLoading}
                  />

                  <div className="mb-3">
                    <label htmlFor="SchoolPhoto" className="form-label">
                      <i className="fas fa-image me-2"></i>Upload Logo
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="SchoolPhoto"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => { setModal(false); resetForm(); }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : null}
                      Save School
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ManageSchools);