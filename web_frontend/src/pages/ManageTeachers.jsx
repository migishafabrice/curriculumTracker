import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import Sidebar from './Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import useLoadSchools from './useLoadSchools';
import { Provinces, Districts, Sectors, Cells, Villages } from 'rwanda';
import Select from 'react-select';
import { useEducationTpes, useLevelTypes, useSectionTypes } from './CourseInfo';

// Initial state for form
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

// Form reducer for complex state management
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

// Custom hook for school sections management
const useSchoolSections = () => {
  const [sections, setSections] = useState([]);
  
  const addSection = useCallback((section) => {
    if (!section.level) throw new Error('Level is required');
    
    setSections(prev => [...prev, {
      ...section,
      id: Date.now() // Use timestamp as temporary ID
    }]);
  }, []);
  
  const removeSection = useCallback((id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  }, []);
  
  const groupSections = useCallback(() => {
    return sections.reduce((groups, section) => {
      if (!groups[section.education_type]) {
        groups[section.education_type] = {
          label: section.education_type_label,
          levels: {}
        };
      }
      
      if (!groups[section.education_type].levels[section.level]) {
        groups[section.education_type].levels[section.level] = {
          label: section.level_label,
          sections: []
        };
      }
      
      groups[section.education_type].levels[section.level].sections.push({
        ...section,
        label: section.option_label || 'General'
      });
      
      return groups;
    }, {});
  }, [sections]);
  
  return { sections, addSection, removeSection, groupSections, setSections };
};

// Custom hook for address management
const useAddressData = () => {
  const [provinces] = useState(() => Provinces());
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  const handleProvinceChange = useCallback((province) => {
    setDistricts(Districts(province) || []);
    setSectors([]);
    setCells([]);
    setVillages([]);
  }, []);

  const handleDistrictChange = useCallback((district, province) => {
    setSectors(Sectors(province, district) || []);
    setCells([]);
    setVillages([]);
  }, []);

  const handleSectorChange = useCallback((sector, province, district) => {
    setCells(Cells(province, district, sector) || []);
    setVillages([]);
  }, []);

  const handleCellChange = useCallback((cell, province, district, sector) => {
    setVillages(Villages(province, district, sector, cell) || []);
  }, []);

  return useMemo(() => ({
    provinces,
    districts,
    sectors,
    cells,
    villages,
    handleProvinceChange,
    handleDistrictChange,
    handleSectorChange,
    handleCellChange
  }), [provinces, districts, sectors, cells, villages, 
      handleProvinceChange, handleDistrictChange, handleSectorChange, handleCellChange]);
};

const ManageSchools = () => {
  // Form state
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [modal, setModal] = useState(false);
  const [notification, setNotification] = useState({ message: null, type: null });
  
  // Address data
  const addressData = useAddressData();
  
  // School sections
  const { sections, addSection, removeSection, groupSections, setSections } = useSchoolSections();
  const groupedSections = useMemo(() => groupSections(), [groupSections]);
  
  // Load data hooks
  const { schools, notice, loadSchools } = useLoadSchools();
  const { educationTypes, educationNotification, fetchEducationTypes } = useEducationTpes();
  const { levelTypes, levelNotification, fetchLevelTypes } = useLevelTypes(formData.education_type);
  const [currentSection, setCurrentSection] = useState({ level: '', option: '' });
  const { sectionTypes, sectionNotification, fetchSectionTypes } = useSectionTypes(currentSection.level);

  // Handle notifications
  useEffect(() => {
    if (educationNotification) setNotification(educationNotification);
    if (levelNotification) setNotification(levelNotification);
    if (sectionNotification) setNotification(sectionNotification);
    if (notice) setNotification(notice);
  }, [educationNotification, levelNotification, notice, sectionNotification]);

  // Initial load
  useEffect(() => {
    fetchEducationTypes();
    loadSchools();
  }, [fetchEducationTypes, loadSchools]);

  // Fetch level types only when education type changes
  useEffect(() => {
    if (formData.education_type) {
      fetchLevelTypes(formData.education_type);
    }
  }, [formData.education_type, fetchLevelTypes]);

  // Fetch section types only when level changes
  useEffect(() => {
    if (currentSection.level) {
      fetchSectionTypes(currentSection.level);
    }
  }, [currentSection.level, fetchSectionTypes]);

  // Handlers
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
      setCurrentSection(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'level' ? { option: '' } : {})
      }));
    }
  }, []);

  const handleAddressChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_ADDRESS', field, value });
    
    // Cascade address changes
    if (field === 'province') {
      addressData.handleProvinceChange(value);
    } else if (field === 'district') {
      addressData.handleDistrictChange(value, formData.address.province);
    } else if (field === 'sector') {
      addressData.handleSectorChange(value, formData.address.province, formData.address.district);
    } else if (field === 'cell') {
      addressData.handleCellChange(value, formData.address.province, formData.address.district, formData.address.sector);
    }
  }, [formData.address, addressData]);

  const handleAddSection = useCallback(() => {
    if (!currentSection.level) {
      setNotification({ message: 'Please select at least level before adding', type: 'error' });
      return;
    }

    if (!formData.education_type) {
      setNotification({ message: 'Please select education type first', type: 'error' });
      return;
    }

    // Check for duplicate section
    const sectionExists = sections.some(
      section => 
        section.level === currentSection.level && 
        section.option === currentSection.option
    );

    if (sectionExists) {
      setNotification({ message: 'This school section already exists', type: 'error' });
      return;
    }

    // Get labels for display purposes
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

    // Reset current section selection
    setCurrentSection({ level: '', option: '' });
  }, [currentSection, educationTypes, formData.education_type, levelTypes, sections, sectionTypes, addSection]);

  // Prepare sections for API in the format section1, section2, etc.
  const prepareSectionsForApi = useCallback(() => {
    return sections.map(section => ({
      education_type: section.education_type,
      level: section.level,
      option: section.option,
    }));
  }, [sections]);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.name || !formData.phone || !formData.email || !formData.education_type) {
        setNotification({ message: 'Please fill all required fields', type: 'error' });
        return;
      }

      if (sections.length === 0) {
        setNotification({ message: 'Please add at least one school section', type: 'error' });
        return;
      }

      // Prepare form data
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      
      // Add address
      const address = `${formData.address.province} - ${formData.address.district} - ${formData.address.sector} - ${formData.address.cell} - ${formData.address.village}`;
      data.append('address', address);
      
      // Add sections as section1, section2, etc.
      const preparedSections = prepareSectionsForApi();
      data.append('sections', JSON.stringify(preparedSections));
      
      // Add logo if exists
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      // Submit to server
      const response = await axios.post('http://localhost:5000/school/addSchool', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Handle response
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
    }
  }, [formData, sections, prepareSectionsForApi, loadSchools, setSections]);

  // Reset form
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET' });
    setSections([]);
    setCurrentSection({ level: '', option: '' });
  }, [setSections]);

  // Memoize school rows to prevent unnecessary re-renders
  const schoolRows = useMemo(() => schools.map((school) => (
    <tr key={school.id}>
      <td>
        <div className="d-flex align-items-center">
          <img 
            src={`http://127.0.0.1:5000${school.logo}`} 
            alt="Avatar" 
            className="avatar"
            loading="lazy" // Add lazy loading
          />
          <div>
            <div className="fw-bold">{school.name}</div>
          </div>
        </div>
      </td>
      <td>{school.telephone}</td>
      <td>{school.email}</td>
      <td>{school.address}</td>
      <td>{school.section_types}</td>
      <td>
        <span className={school.active ? "badge bg-success status-badge" : "badge bg-danger status-badge"}>
          {school.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        <button className="btn btn-sm btn-outline-primary">
          <i className="fas fa-edit"></i>
        </button>
        <button className="btn btn-sm btn-outline-danger">
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  )), [schools]);

  return (
    <>
      {notification.message && <ToastMessage message={notification.message} type={notification.type} />}
      <Sidebar />
      <div className="page-content">
        <div id="Schools-page" className="page">
          <div className="page-header">
            <h1 className="h2">Schools Management</h1>
            <div>
              <button className="btn btn-primary" onClick={() => setModal(true)}>
                <i className="fas fa-plus"></i> Add New School
              </button>
            </div>
          </div>
          
          {/* Schools List */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Schools List</h5>
            </div>
            {schools.length > 0 ? (
              <div className="card-body">
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
                      {schoolRows}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card-body">
                <p>No schools found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add School Modal */}
      {modal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add New School</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
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
                      />
                      <label htmlFor="SchoolName"><i className="fas fa-user me-2"></i>Name</label>
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
                      />
                      <label htmlFor="SchoolPhone"><i className="fas fa-phone me-2"></i>Phone</label>
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
                      />
                      <label htmlFor="SchoolEmail"><i className="fas fa-envelope me-2"></i>Email</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="CourseCategory">
                      <i className="fas fa-tags me-2"></i>Education Type
                    </label>
                    <div className="mb-3">
                      <Select
                        id="CourseCategory"
                        isClearable={true}
                        options={educationTypes}
                        onChange={(selected) => handleSelectChange("education_type", selected)}
                        value={educationTypes.find(opt => opt.value === formData.education_type)}
                        placeholder="Select Education Type"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* School Sections Management */}
                <div className="mb-4 border-top pt-3">
                  <h5 className="mb-3">School Sections</h5>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="CourseTitle">
                        <i className="fas fa-level-up-alt me-2"></i>Education Level
                      </label>
                      <div className="mb-3">
                        <Select
                          id="CourseGrade"
                          isClearable={true}
                          options={levelTypes}
                          onChange={(selected) => handleSelectChange("level", selected)}
                          placeholder="Select Level"
                          value={levelTypes.find(opt => opt.value === currentSection.level)}
                        />
                      </div>
                    </div>
                   
                    <div className="col-md-6">
                      <label htmlFor="CourseSection">
                        <i className="fas fa-th-large me-2"></i>Education Option
                      </label>
                      <div className="mb-3">
                        <Select
                          id="CourseSection"
                          isClearable={true}
                          options={sectionTypes}
                          onChange={(selected) => handleSelectChange("option", selected)}
                          placeholder="Select Option"
                          value={sectionTypes.find(opt => opt.value === currentSection.option)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleAddSection}
                      disabled={!currentSection.level || !formData.education_type}
                    >
                      <i className="fas fa-plus me-2"></i>Add to School Sections
                    </button>
                  </div>

                  {sections.length > 0 && (
                    <div className="mt-4">
                      <h6>Selected School Sections</h6>
                      <div className="table-responsive">
                        {Object.entries(groupedSections).map(([eduType, eduTypeData]) => (
                          <div key={eduType} className="mb-4">
                            <h6 className="bg-light p-2">{eduTypeData.label}</h6>
                            {Object.entries(eduTypeData.levels).map(([level, levelData]) => (
                              <div key={level} className="ms-3 mb-3">
                                <h6 className="text-muted">{levelData.label}</h6>
                                <div className="d-flex flex-wrap gap-2 ms-3">
                                  {levelData.sections.map((section) => (
                                    <span key={section.id} className="badge bg-primary d-inline-flex align-items-center">
                                      {section.label}
                                      <button 
                                        type="button" 
                                        className="btn-close btn-close-white ms-2" 
                                        onClick={() => removeSection(section.id)}
                                        aria-label="Remove"
                                      />
                                    </span>
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

                {/* Address Information */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        id="schoolProvince"
                        name="province"
                        value={formData.address.province}
                        onChange={(e) => handleAddressChange('province', e.target.value)}
                        required
                      >
                        <option value="">Select Province</option>
                        {addressData.provinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="schoolProvince"><i className="fas fa-globe-africa me-2"></i>Province</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        id="schoolDistrict"
                        name="district"
                        value={formData.address.district}
                        onChange={(e) => handleAddressChange('district', e.target.value)}
                        required
                        disabled={!formData.address.province}
                      >
                        <option value="">Select District</option>
                        {addressData.districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="schoolDistrict"><i className="fas fa-city me-2"></i>District</label>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        id="schoolSector"
                        name="sector"
                        value={formData.address.sector}
                        onChange={(e) => handleAddressChange('sector', e.target.value)}
                        required
                        disabled={!formData.address.district}
                      >
                        <option value="">Select Sector</option>
                        {addressData.sectors.map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="schoolSector"><i className="fas fa-globe-africa me-2"></i>Sector</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        id="schoolCell"
                        name="cell"
                        value={formData.address.cell}
                        onChange={(e) => handleAddressChange('cell', e.target.value)}
                        required
                        disabled={!formData.address.sector}
                      >
                        <option value="">Select Cell</option>
                        {addressData.cells.map((cell) => (
                          <option key={cell} value={cell}>
                            {cell}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="schoolCell"><i className="fas fa-city me-2"></i>Cell</label>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        id="schoolVillage"
                        name="village"
                        value={formData.address.village}
                        onChange={(e) => handleAddressChange('village', e.target.value)}
                        required
                        disabled={!formData.address.cell}
                      >
                        <option value="">Select Village</option>
                        {addressData.villages.map((village) => (
                          <option key={village} value={village}>
                            {village}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="schoolVillage"><i className="fas fa-globe-africa me-2"></i>Village</label>
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="mb-3">
                  <label htmlFor="SchoolPhoto" className="form-label">
                    <i className="fas fa-image me-2"></i>Upload Logo
                  </label>
                  <input
                    className="form-control"
                    name="logo"
                    onChange={handleFileChange}
                    type="file"
                    id="SchoolPhoto"
                    accept="image/*"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setModal(false); resetForm(); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
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