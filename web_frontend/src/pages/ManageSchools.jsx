import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import useLoadSchools from './useLoadSchools';
import { Provinces, Districts, Sectors, Cells, Villages } from 'rwanda';
import Select from 'react-select';
import { useEducationTpes, useLevelTypes, useSectionTypes } from './CourseInfo';

const ManageSchools = () => {
  // School basic information form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    education_type: '',
    logo: null,
  });

  // School sections management
  const [schoolSections, setSchoolSections] = useState([]);
  const [currentSection, setCurrentSection] = useState({
    level: '',
    option: '',
    class: ''
  });

  // UI and data state
  const [modal, setModal] = useState(false);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  // Load initial provinces data
  useEffect(() => {
    setProvinces(Provinces());
  }, []);

  // Load schools data
  const { schools, notice, loadSchools } = useLoadSchools();
  useEffect(() => {
    if (notice) {
      setNotification(notice);
    }
    loadSchools();
  }, [loadSchools, notice]);

  // Load education types
  const { educationTypes, notification: educationTypeNotification, fetchEducationTypes } = useEducationTpes();
  useEffect(() => {
    if (educationTypeNotification) {
      setNotification(educationTypeNotification);
    }
    fetchEducationTypes();
  }, [fetchEducationTypes, educationTypeNotification]);

  // Load level types based on selected education type
  const { levelTypes, notification: levelTypeNotification, fetchLevelTypes } = useLevelTypes(formData.education_type);
  useEffect(() => {
    if (levelTypeNotification) {
      setNotification(levelTypeNotification);
    }
    if (formData.education_type) {
      fetchLevelTypes(formData.education_type);
    }
  }, [formData.education_type, fetchLevelTypes, levelTypeNotification]);

  // Load section types and classes based on selected level
  const { sectionTypes, classes, notification: sectionTypeNotification, fetchSectionTypes } = useSectionTypes(currentSection.level);
  useEffect(() => {
    if (sectionTypeNotification) {
      setNotification(sectionTypeNotification);
    }
    if (currentSection.level) {
      fetchSectionTypes(currentSection.level);
    }
  }, [currentSection.level, fetchSectionTypes, sectionTypeNotification]);

  // Handle address selection changes
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData({ ...formData, province, district: '', sector: '', cell: '', village: '' });
    setDistricts(Districts(province) || []);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData({ ...formData, district, sector: '', cell: '', village: '' });
    setSectors(Sectors(formData.province, district) || []);
  };

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setFormData({ ...formData, sector, cell: '', village: '' });
    setCells(Cells(formData.province, formData.district, sector) || []);
  };

  const handleCellChange = (e) => {
    const cell = e.target.value;
    setFormData({ ...formData, cell, village: '' });
    setVillages(Villages(formData.province, formData.district, formData.sector, cell) || []);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  // Handle select dropdown changes
  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    
    if (name === 'education_type') {
      setFormData({ ...formData, [name]: value });
    } else {
      setCurrentSection(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'level' ? { option: '', class: '' } : {}),
        ...(name === 'option' ? { class: '' } : {})
      }));
    }
  };

  // Add a new school section to the list
  const addSchoolSection = () => {
    if (!currentSection.level || !currentSection.class) {
      setNotification({ message: 'Please select at least level and class before adding', type: 'error' });
      return;
    }

    if (!formData.education_type) {
      setNotification({ message: 'Please select education type first', type: 'error' });
      return;
    }

    // Check for duplicate section
    const sectionExists = schoolSections.some(
      section => 
        section.level === currentSection.level && 
        section.option === currentSection.option && 
        section.class === currentSection.class
    );

    if (sectionExists) {
      setNotification({ message: 'This school section already exists', type: 'error' });
      return;
    }

    // Get labels for display purposes
    const educationTypeLabel = educationTypes.find(et => et.value === formData.education_type)?.label || formData.education_type;
    const levelLabel = levelTypes.find(lt => lt.value === currentSection.level)?.label || currentSection.level;
    const optionLabel = sectionTypes?.find(st => st.value === currentSection.option)?.label || currentSection.option || 'General';
    const classLabel = classes.find(c => c.value === currentSection.class)?.label || currentSection.class;

    setSchoolSections(prev => [
      ...prev,
      {
        ...currentSection,
        education_type: formData.education_type,
        education_type_label: educationTypeLabel,
        level_label: levelLabel,
        option_label: optionLabel,
        class_label: classLabel
      }
    ]);

    // Reset current section selection
    setCurrentSection({
      level: '',
      option: '',
      class: ''
    });
  };

  // Remove a school section from the list
  const removeSchoolSection = (index) => {
    setSchoolSections(prev => prev.filter((_, i) => i !== index));
  };

  // Group sections for display
  const groupSections = () => {
    return schoolSections.reduce((groups, section) => {
      // Initialize education type group if it doesn't exist
      if (!groups[section.education_type]) {
        groups[section.education_type] = {
          label: section.education_type_label,
          levels: {}
        };
      }

      // Initialize level group if it doesn't exist
      if (!groups[section.education_type].levels[section.level]) {
        groups[section.education_type].levels[section.level] = {
          label: section.level_label,
          options: {}
        };
      }

      // Use 'general' as key if no option specified
      const optionKey = section.option || 'general';
      const optionLabel = section.option_label;

      // Initialize option group if it doesn't exist
      if (!groups[section.education_type].levels[section.level].options[optionKey]) {
        groups[section.education_type].levels[section.level].options[optionKey] = {
          label: optionLabel,
          classes: []
        };
      }

      // Add class to the option group
      groups[section.education_type].levels[section.level].options[optionKey].classes.push({
        value: section.class,
        label: section.class_label,
        originalIndex: schoolSections.indexOf(section)
      });

      return groups;
    }, {});
  };

  // Validate form inputs
  const inputValidate = ({ name, phone, email, province, district, sector, cell, village }) => {
    const errors = [];
    if (!name) errors.push('Name cannot be empty.');
    if (!phone) errors.push('Phone cannot be empty.');
    if (!email) errors.push('Email cannot be empty.');
    if (!province || province === 'Select Province') errors.push('Invalid province selected.');
    if (!district || district === 'Select District') errors.push('Invalid district selected.');
    if (!sector || sector === 'Select Sector') errors.push('Invalid sector selected.');
    if (!cell || cell === 'Select Cell') errors.push('Invalid cell selected.');
    if (!village || village === 'Select Village') errors.push('Invalid village selected.');
    return { isValid: errors.length === 0, errors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate basic form data
      const { isValid, errors } = inputValidate(formData);
      if (!isValid) {
        setNotification({ message: errors.join(', '), type: 'error' });
        return;
      }

      // Validate school sections
      if (schoolSections.length === 0) {
        setNotification({ message: 'Please add at least one school section', type: 'error' });
        return;
      }

      // Prepare form data
      const data = new FormData();
      data.append('address', `${formData.province} - ${formData.district} - ${formData.sector} - ${formData.cell} - ${formData.village}`);
      data.append('school_sections', JSON.stringify(schoolSections));
      
      // Append other form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'province' && key !== 'district' && key !== 'sector' && key !== 'cell' && key !== 'village') {
          data.append(key, value);
        }
      });

      // Submit to server
      const response = await axios.post('http://localhost:5000/school/addSchool', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Handle response
      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        loadSchools();
        resetForm();
        setModal(false);
      } else {
        setNotification({ message: response.data.error, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      education_type: '',
      logo: null,
    });
    setCurrentSection({ level: '', option: '', class: '' });
    setSchoolSections([]);
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
  };

  // Get grouped sections for display
  const groupedSections = groupSections();

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
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map((school) => (
                        <tr key={school.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img src={`http://127.0.0.1:5000${school.logo}`} alt="Avatar" className="avatar" />
                              <div>
                                <div className="fw-bold">{school.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>{school.telephone}</td>
                          <td>{school.email}</td>
                          <td>{school.address}</td>
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
                      ))}
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
      <div className="modal" style={{ display: modal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                    <div className="col-md-4">
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
                    {sectionTypes && sectionTypes.length > 0 && (
                      <div className="col-md-4">
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
                    )}
                    <div className="col-md-4">
                      <label htmlFor="CourseClass">
                        <i className="fas fa-chalkboard me-2"></i>Class/Promotion
                      </label>
                      <div className="mb-3">
                        <Select
                          id="CourseClass"
                          isClearable={true}
                          options={classes}
                          onChange={(selected) => handleSelectChange("class", selected)}
                          placeholder="Select Class"
                          value={classes.find(opt => opt.value === currentSection.class)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={addSchoolSection}
                      disabled={!currentSection.level || !currentSection.class || !formData.education_type}
                    >
                      <i className="fas fa-plus me-2"></i>Add to School Sections
                    </button>
                  </div>

                  {schoolSections.length > 0 && (
                    <div className="mt-4">
                      <h6>Selected School Sections</h6>
                      <div className="table-responsive">
                        {Object.entries(groupedSections).map(([eduType, eduTypeData]) => (
                          <div key={eduType} className="mb-4">
                            <h6 className="bg-light p-2">{eduTypeData.label}</h6>
                            {Object.entries(eduTypeData.levels).map(([level, levelData]) => (
                              <div key={level} className="ms-3 mb-3">
                                <h6 className="text-muted">{levelData.label}</h6>
                                {Object.entries(levelData.options).map(([option, optionData]) => (
                                  <div key={option} className="ms-3 mb-2">
                                    <p className="mb-1 fw-bold">{optionData.label}</p>
                                    <div className="d-flex flex-wrap gap-2">
                                      {optionData.classes.map((classItem) => (
                                        <span key={classItem.value} className="badge bg-primary d-flex align-items-center">
                                          {classItem.label}
                                          <button 
                                            type="button" 
                                            className="btn-close btn-close-white ms-2" 
                                            onClick={() => removeSchoolSection(classItem.originalIndex)}
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
                        value={formData.province}
                        onChange={handleProvinceChange}
                      >
                        <option>Select Province</option>
                        {provinces.map((province) => (
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
                        value={formData.district}
                        onChange={handleDistrictChange}
                      >
                        <option>Select District</option>
                        {districts.map((district) => (
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
                        value={formData.sector}
                        onChange={handleSectorChange}
                      >
                        <option>Select Sector</option>
                        {sectors.map((sector) => (
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
                        value={formData.cell}
                        onChange={handleCellChange}
                      >
                        <option>Select Cell</option>
                        {cells.map((cell) => (
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
                        value={formData.village}
                        onChange={handleInputChange}
                      >
                        <option>Select Village</option>
                        {villages.map((village) => (
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
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
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
    </>
  );
};

export default ManageSchools;