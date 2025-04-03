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
  // Form state
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    province: '', district: '', sector: '', cell: '', village: '',
    education_type: '', logo: null
  });

  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState({
    level: '', option: '', class: ''
  });

  // UI state
  const [modal, setModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [provinces] = useState(Provinces());
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  // Data hooks
  const { schools, notice, loadSchools } = useLoadSchools();
  const { educationTypes } = useEducationTpes();
  const { levelTypes, fetchLevelTypes } = useLevelTypes(formData.education_type);
  const { sectionTypes, classes, fetchSectionTypes } = useSectionTypes(currentSection.level);

  useEffect(() => {
    if (notice) setNotification(notice);
    loadSchools();
  }, [notice]);

  useEffect(() => {
    if (formData.education_type) fetchLevelTypes(formData.education_type);
  }, [formData.education_type]);

  useEffect(() => {
    if (currentSection.level) fetchSectionTypes(currentSection.level);
  }, [currentSection.level]);

  // Location handlers
  const updateLocation = (field, value, clearFields = []) => {
    const updates = { [field]: value, ...clearFields.reduce((a, f) => ({ ...a, [f]: '' }), {}) };
    setFormData(prev => ({ ...prev, ...updates }));
    
    if (field === 'province') setDistricts(Districts(value) || []);
    if (field === 'district') setSectors(Sectors(formData.province, value) || []);
    if (field === 'sector') setCells(Cells(formData.province, formData.district, value) || []);
    if (field === 'cell') setVillages(Villages(formData.province, formData.district, formData.sector, value) || []);
  };

  // Section management
  const addSection = () => {
    if (!currentSection.level || !currentSection.class) {
      setNotification({ message: 'Level and Class are required', type: 'error' });
      return;
    }

    const newSection = {
      ...currentSection,
      education_type: formData.education_type,
      labels: {
        education: educationTypes.find(et => et.value === formData.education_type)?.label,
        level: levelTypes.find(lt => lt.value === currentSection.level)?.label,
        option: sectionTypes?.find(st => st.value === currentSection.option)?.label,
        class: classes.find(c => c.value === currentSection.class)?.label
      }
    };

    setSections(prev => [...prev, newSection]);
    setCurrentSection({ level: '', option: '', class: '' });
  };

  const removeSection = (index) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'phone', 'email', 'province', 'district', 'sector', 'cell', 'village'];
    const missing = requiredFields.filter(f => !formData[f]);
    if (missing.length) {
      setNotification({ message: `Missing: ${missing.join(', ')}`, type: 'error' });
      return;
    }

    if (!sections.length) {
      setNotification({ message: 'Add at least one section', type: 'error' });
      return;
    }

    const data = new FormData();
    data.append('address', `${formData.province}, ${formData.district}, ${formData.sector}, ${formData.cell}, ${formData.village}`);
    data.append('sections', JSON.stringify(sections));
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && !['province', 'district', 'sector', 'cell', 'village'].includes(key)) {
        data.append(key, value);
      }
    });

    try {
      const res = await axios.post('http://localhost:5000/school/addSchool', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotification({ message: res.data.message, type: 'success' });
      loadSchools();
      setModal(false);
    } catch (err) {
      setNotification({ message: err.response?.data?.error || err.message, type: 'error' });
    }
  };

  // Group sections for display
  const groupedSections = sections.reduce((groups, section, index) => {
    const key = `${section.education_type}-${section.level}-${section.option || 'general'}`;
    if (!groups[key]) {
      groups[key] = {
        education: section.labels.education,
        level: section.labels.level,
        option: section.labels.option || 'General',
        classes: []
      };
    }
    groups[key].classes.push({ label: section.labels.class, index });
    return groups;
  }, {});

  return (
    <>
      {notification && <ToastMessage {...notification} />}
      <Sidebar />
      
      <div className="page-content">
        <div className="page">
          <div className="page-header">
            <h1 className="h2">Schools Management</h1>
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              <i className="fas fa-plus me-2"></i>Add School
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              {schools.length > 0 ? (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map(school => (
                      <tr key={school.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={`http://127.0.0.1:5000${school.logo}`} 
                                 alt="School logo" 
                                 className="rounded-circle me-2" 
                                 width="40" 
                                 height="40" />
                            <span className="fw-semibold">{school.name}</span>
                          </div>
                        </td>
                        <td>
                          <div>{school.telephone}</div>
                          <small className="text-muted">{school.email}</small>
                        </td>
                        <td>
                          <small>{school.address}</small>
                        </td>
                        <td>
                          <span className={`badge ${school.active ? 'bg-success' : 'bg-secondary'}`}>
                            {school.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1">
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
              ) : (
                <div className="text-center py-4">
                  <p>No schools found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add School Modal */}
      {modal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add New School</h5>
                <button type="button" className="btn-close btn-close-white" 
                        onClick={() => setModal(false)}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* School Info */}
                    <div className="col-md-4">
                      <label className="form-label">School Name</label>
                      <input type="text" className="form-control" 
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Phone</label>
                      <input type="text" className="form-control" 
                             value={formData.phone}
                             onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" 
                             value={formData.email}
                             onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>

                    {/* Education Type */}
                    <div className="col-md-12">
                      <label className="form-label">Education Type</label>
                      <Select options={educationTypes}
                              onChange={(opt) => setFormData({...formData, education_type: opt.value})}
                              value={educationTypes.find(et => et.value === formData.education_type)} />
                    </div>

                    {/* Sections */}
                    <div className="col-md-12 border-top mt-3 pt-3">
                      <h6>School Sections</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-md-4">
                          <label className="form-label">Level</label>
                          <Select options={levelTypes}
                                  onChange={(opt) => setCurrentSection({...currentSection, level: opt.value})}
                                  value={levelTypes.find(lt => lt.value === currentSection.level)} />
                        </div>
                        {sectionTypes?.length > 0 && (
                          <div className="col-md-4">
                            <label className="form-label">Option</label>
                            <Select options={sectionTypes}
                                    onChange={(opt) => setCurrentSection({...currentSection, option: opt.value})}
                                    value={sectionTypes.find(st => st.value === currentSection.option)} />
                          </div>
                        )}
                        <div className="col-md-4">
                          <label className="form-label">Class</label>
                          <Select options={classes}
                                  onChange={(opt) => setCurrentSection({...currentSection, class: opt.value})}
                                  value={classes.find(c => c.value === currentSection.class)} />
                        </div>
                      </div>
                      <button type="button" className="btn btn-sm btn-primary mb-3"
                              onClick={addSection}
                              disabled={!currentSection.level || !currentSection.class}>
                        <i className="fas fa-plus me-1"></i>Add Section
                      </button>

                      {Object.values(groupedSections).length > 0 && (
                        <div className="border rounded p-2">
                          {Object.values(groupedSections).map((group, i) => (
                            <div key={i} className="mb-2">
                              <div className="d-flex align-items-center">
                                <strong className="me-2">{group.education}</strong>
                                <span className="me-2">→</span>
                                <strong>{group.level}</strong>
                                {group.option !== 'General' && (
                                  <>
                                    <span className="mx-2">→</span>
                                    <em>{group.option}</em>
                                  </>
                                )}
                              </div>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {group.classes.map((cls, j) => (
                                  <span key={j} className="badge bg-light text-dark border d-flex align-items-center">
                                    {cls.label}
                                    <button type="button" className="btn-close btn-close-black ms-1"
                                            onClick={() => removeSection(cls.index)}
                                            style={{ fontSize: '0.5rem' }} />
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="col-md-12 border-top mt-3 pt-3">
                      <h6>Location</h6>
                      <div className="row g-2">
                        <div className="col-md-4">
                          <label className="form-label">Province</label>
                          <select className="form-select"
                                  value={formData.province}
                                  onChange={(e) => updateLocation('province', e.target.value, 
                                                              ['district', 'sector', 'cell', 'village'])}>
                            <option value="">Select Province</option>
                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">District</label>
                          <select className="form-select"
                                  value={formData.district}
                                  onChange={(e) => updateLocation('district', e.target.value, 
                                                              ['sector', 'cell', 'village'])}>
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Sector</label>
                          <select className="form-select"
                                  value={formData.sector}
                                  onChange={(e) => updateLocation('sector', e.target.value, 
                                                              ['cell', 'village'])}>
                            <option value="">Select Sector</option>
                            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Cell</label>
                          <select className="form-select"
                                  value={formData.cell}
                                  onChange={(e) => updateLocation('cell', e.target.value, ['village'])}>
                            <option value="">Select Cell</option>
                            {cells.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Village</label>
                          <select className="form-select"
                                  value={formData.village}
                                  onChange={(e) => setFormData({...formData, village: e.target.value})}>
                            <option value="">Select Village</option>
                            {villages.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="col-md-12">
                      <label className="form-label">School Logo</label>
                      <input type="file" className="form-control" 
                             onChange={(e) => setFormData({...formData, logo: e.target.files[0]})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" 
                          onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save School</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageSchools;