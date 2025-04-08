import React, { useState, useEffect, useCallback, useReducer } from 'react';
import Sidebar from './Sidebar';
import useLoadSchools from './useLoadSchools';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import Address from './Address';

// Define initial form data and reducer outside the component
const initialFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  school: "",
  photo: null,
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
      return initialFormData;
    default:
      return state;
  }
};

const ManageTeachers = () => {
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { schools, notice, loadSchools } = useLoadSchools();

  const schoolOptions = schools.map((school) => ({
    value: school.code, 
    label: school.name, 
  }));

  useEffect(() => {
    if (notice) {
      setNotification(notice);
    }
  }, [notice]);

  // Load schools and teachers when the component mounts
  useEffect(() => {
    loadSchools();
    fetchTeachers();
  }, [loadSchools]);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/teacher/getTeachers');
      setTeachers(response.data);
    } catch (error) {
      setNotification({ message: `Error fetching teachers: ${error.message}`, type: 'error' });
    } 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  };

  const handleAddressChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_ADDRESS', field, value });
  }, []);

  const handleFileChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'photo', value: e.target.files[0] });
  };

  const handleSchoolChange = (selectedOption) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'school',
      value: selectedOption ? selectedOption.value : ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append all form fields
      data.append('firstname', formData.firstname);
      data.append('lastname', formData.lastname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('school', formData.school);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }
      
      // Append address fields
      Object.entries(formData.address).forEach(([key, value]) => {
        data.append(`address[${key}]`, value);
      });

      const response = await axios.post('http://localhost:5000/teacher/addTeacher', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        fetchTeachers();
        dispatch({ type: 'RESET' });
        // Close the modal
        document.getElementById('closeAddTeacherModal').click();
      } else {
        setNotification({ message: response.data.error, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error: ${error.response?.data?.message || error.message}`, type: 'error' });
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/teacher/deleteTeacher/${teacherId}`);
        if (response.data.type === 'success') {
          setNotification({ message: response.data.message, type: 'success' });
          fetchTeachers();
        }
      } catch (error) {
        setNotification({ message: `Error deleting teacher: ${error.message}`, type: 'error' });
      }
    }
  };

  // Filter teachers based on search term and status filter
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         teacher.lastname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {notification.message && <ToastMessage message={notification.message} type={notification.type} />}
      <Sidebar/>
      <div className="page-content">
        <div id="teachers-page" className="page">
          <div className="page-header">
            <h1 className="h2">Teachers Management</h1>
            <div>
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTeacherModal">
                <i className="fas fa-plus"></i> Add New Teacher
              </button>
            </div>
          </div>
                    
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Teachers List</h5>
            </div>
            <div className="d-flex justify-content-end align-items-center mt-4 mb-3 pe-3" style={{ width: "60%", marginLeft: "auto" }}>
              {/* Search Input */}
              <div className="input-group me-2">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="teacherSearch" 
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            
              {/* Filter Dropdown */}
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-filter"></i></span>
                <select 
                  className="form-select" 
                  id="filterStatus"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
            
            <div className="card-body">
              {isLoading ? (
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
                          <th>ID</th>
                          <th>Teacher</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>School</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher) => (
                            <tr key={teacher._id}>
                              <td>{teacher.teacherId || teacher._id.substring(0, 6)}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {teacher.photo ? (
                                    <img 
                                      src={`http://localhost:5000/uploads/${teacher.photo}`} 
                                      alt="Avatar" 
                                      className="avatar" 
                                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                    />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {teacher.firstname.charAt(0)}{teacher.lastname.charAt(0)}
                                    </div>
                                  )}
                                  <div className="ms-2">
                                    <div className="fw-bold">{teacher.firstname} {teacher.lastname}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{teacher.email}</td>
                              <td>{teacher.phone}</td>
                              <td>
                                {schools.find(s => s.code === teacher.school)?.name || 'N/A'}
                              </td>
                              <td>
                                <span className={`badge ${teacher.status === 'active' ? 'bg-success' : 'bg-warning'} status-badge`}>
                                  {teacher.status === 'active' ? 'Active' : 'On Leave'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-2">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteTeacher(teacher._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">No teachers found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <nav>
                    <ul className="pagination justify-content-end">
                      <li className="page-item disabled"><a className="page-link" href="#">Previous</a></li>
                      <li className="page-item active"><a className="page-link" href="#">1</a></li>
                      <li className="page-item"><a className="page-link" href="#">2</a></li>
                      <li className="page-item"><a className="page-link" href="#">3</a></li>
                      <li className="page-item"><a className="page-link" href="#">Next</a></li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    
      {/* Modal to add new teacher */}
      <div className="modal fade" id="addTeacherModal" tabIndex="-1" aria-labelledby="addTeacherModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="addTeacherModalLabel">Add New Teacher</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                id="closeAddTeacherModal"
              ></button>
            </div>
            <div className="modal-body">
              <form id="teacherForm" onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input 
                        type="text" 
                        name='firstname' 
                        value={formData.firstname} 
                        onChange={handleInputChange} 
                        className="form-control" 
                        id="teacherFirstName" 
                        placeholder="First Name"
                        required
                      />
                      <label htmlFor="teacherFirstName"><i className="fas fa-user me-2"></i>First Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input 
                        type="text" 
                        name='lastname' 
                        value={formData.lastname} 
                        onChange={handleInputChange} 
                        className="form-control" 
                        id="teacherLastName" 
                        placeholder="Last Name"
                        required
                      />
                      <label htmlFor="teacherLastName"><i className="fas fa-user me-2"></i>Last Name</label>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input 
                        type="email" 
                        name='email' 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="form-control" 
                        id="teacherEmail" 
                        placeholder="Email"
                        required
                      />
                      <label htmlFor="teacherEmail"><i className="fas fa-envelope me-2"></i>Email</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input 
                        type="tel" 
                        name='phone' 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="form-control" 
                        id="teacherPhone" 
                        placeholder="Phone"
                        required
                      />
                      <label htmlFor="teacherPhone"><i className="fas fa-phone me-2"></i>Phone</label>
                    </div>
                  </div>
                </div>
                
                <Address
                  address={formData.address} 
                  onChange={handleAddressChange} 
                />
                
                <div className="mb-3">
                  <label htmlFor="teacherSchool" className="form-label"><i className="fas fa-school me-2"></i>School</label>
                  <Select
                    id="teacherSchool"
                    name='school'
                    classNamePrefix="select"
                    placeholder="Select School"
                    isClearable={true} 
                    isSearchable={true} 
                    options={schoolOptions} 
                    value={schoolOptions.find(option => option.value === formData.school) || null}
                    onChange={handleSchoolChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="teacherPhoto" className="form-label"><i className="fas fa-image me-2"></i>Upload Photo</label>
                  <input 
                    className="form-control" 
                    name='photo' 
                    onChange={handleFileChange} 
                    type="file" 
                    id="teacherPhoto"
                    accept="image/*"
                  />
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Teacher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageTeachers;