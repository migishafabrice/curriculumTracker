import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import Sidebar from './Sidebar';
import useLoadSchools from './useLoadSchools';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import Address from './Address';
import { getCurrentUser } from './AuthUser'; 
const user=getCurrentUser(); 
// Define initial form data and reducer outside the component
const initialFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  school: user?.role==="School" ?user.userid : "",
  photo: null,
  role:"",
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
  const [currentPage, setCurrentPage] = useState(1);
  const { schools, notice, loadSchools } = useLoadSchools();

  const teachersPerPage = 10;

  const schoolOptions = useMemo(() => 
    schools.map((school) => ({
      value: school.code, 
      label: school.name, 
    }))
  , [schools]);

  // Notification effect with cleanup
  useEffect(() => {
    if (notice) {
      setNotification(notice);
    }
  }, [notice]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: null, type: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load schools and teachers on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadSchools();
      await fetchTeachers();
    };
    initializeData();
  }, []);


  const fetchTeachers = async () => {
    try {
      let response;
      if (user.role === 'School') {
        response = await axios.get('http://localhost:5000/teacher/allTeachers', {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { userid: user.userid }
        });
      } else {
        response = await axios.get('http://localhost:5000/teacher/allTeachers', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
  
      if (response.data.teachers && response.data.type === "success") {
        setTeachers(Array.isArray(response.data.teachers) ? response.data.teachers : []);
      } else if (response.data.type === "error") {
        setNotification({ message: response.data.message, type: "error" });
      }
    } catch (error) {
      setNotification({ 
        message: `Error fetching teachers: ${error.message}`, 
        type: 'error' 
      });
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    // Add additional type checking to be safe
    if (!Array.isArray(teachers)) return [];
    
    return teachers.filter(teacher => {
      // Add null checks for teacher properties
      const firstname = teacher?.firstname?.toLowerCase() || '';
      const lastname = teacher?.lastname?.toLowerCase() || '';
      const status = teacher?.status || '';
      
      const matchesSearch = firstname.includes(searchTerm.toLowerCase()) || 
                          lastname.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, statusFilter]);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * teachersPerPage;
    return filteredTeachers.slice(startIndex, startIndex + teachersPerPage);
  }, [filteredTeachers, currentPage]);
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page when teachers list changes
  }, [teachers]);
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

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

  const validateForm = () => {
    if (!formData.firstname || !formData.lastname) {
      setNotification({ message: 'First and last name are required', type: 'error' });
      return false;
    }
    if (!formData.email.includes('@')) {
      setNotification({ message: 'Please enter a valid email', type: 'error' });
      return false;
    }
    if (!formData.phone) {
      setNotification({ message: 'Phone number is required', type: 'error' });
      return false;
    }
    if (!formData.role) {
      setNotification({ message: 'Role is required', type: 'error' });
      return false;
    }
    if (!formData.school) {
      setNotification({ message: 'School is required ' , type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const data = new FormData();
      // Append all form fields
      data.append('firstname', formData.firstname);
      data.append('lastname', formData.lastname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('school', formData.school);
      data.append('role', formData.role);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }
      const response = await axios.post(
        'http://localhost:5000/teacher/addTeacher', 
        data, 
        { headers: { 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
         
        } }
      );

      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        await fetchTeachers();
        dispatch({ type: 'RESET' });
        document.getElementById('closeAddTeacherModal').click();
      } else {
        setNotification({ message: response.data.error, type: 'error' });
      }
    } catch (error) {
      setNotification({ 
        message: `Error: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/teacher/deleteTeacher/${teacherId}`
        );
        if (response.data.type === 'success') {
          setNotification({ message: response.data.message, type: 'success' });
          await fetchTeachers();
        }
      } catch (error) {
        setNotification({ 
          message: `Error deleting teacher: ${error.message}`, 
          type: 'error' 
        });
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      {notification.message && (
        <ToastMessage 
          message={notification.message} 
          type={notification.type} 
        />
      )}
      <Sidebar/>
      <div className="page-content">
        <div id="teachers-page" className="page">
          <div className="page-header">
            <h1 className="h2">Teachers Management</h1>
            <div>
              <button 
                className="btn btn-primary" 
                data-bs-toggle="modal" 
                data-bs-target="#addTeacherModal"
              >
                <i className="fas fa-plus"></i> Add New Teacher
              </button>
            </div>
          </div>
                    
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Teachers List</h5>
            </div>
            <div className="d-flex justify-content-end align-items-center mt-4 mb-3 pe-3" 
                 style={{ width: "60%", marginLeft: "auto" }}>
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
                          
                          <th>Teacher</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>School</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTeachers.length > 0 ? (
                          paginatedTeachers.map((teacher) => (
                            <tr key={teacher._id}>
                              
                              <td>
                                <div className="d-flex align-items-center">
                                  {teacher.photo ? (
                                    <img 
                                    src={`http://localhost:5000${teacher.photo}`} 
                                    alt="Avatar" 
                                    className="avatar" 
                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/assets/img/no-image.png';
                                    }}
                                  />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {teacher.firstname.charAt(0)}{teacher.lastname.charAt(0)}
                                    </div>
                                  )}
                                  <div className="ms-2">
                                    <div className="fw-bold">
                                      {teacher.firstname} {teacher.lastname}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{teacher.email}</td>
                              <td>{teacher.telephone}</td>
                              <td>
                                {schools.find(s => s.code === teacher.school)?.name || 'N/A'}
                              </td>
                              <td>
                                <span className={`badge ${teacher.active === 1 ? 'bg-success' : 'bg-warning'} status-badge`}>
                                  {teacher.active === 1 ? 'Active' : 'Deactivated'}
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
                  
                  {/* Pagination */}
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
    
      {/* Modal to add new teacher */}
      <div className="modal fade" id="addTeacherModal" tabIndex="-1" aria-labelledby="addTeacherModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-black text-white">
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
                      <label htmlFor="teacherFirstName">
                        <i className="fas fa-user me-2"></i>First Name
                      </label>
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
                      <label htmlFor="teacherLastName">
                        <i className="fas fa-user me-2"></i>Last Name
                      </label>
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
                      <label htmlFor="teacherEmail">
                        <i className="fas fa-envelope me-2"></i>Email
                      </label>
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
                      <label htmlFor="teacherPhone">
                        <i className="fas fa-phone me-2"></i>Phone
                      </label>
                    </div>
                  </div>
                </div>
                {user.role!=='School' && <Address
                  address={formData.address} 
                  onChange={handleAddressChange} 
                />}
                
                
                <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="teacherSchool" className="form-label">
                    <i className="fas fa-school me-2"></i>School
                  </label>
                  {user.role!=='School' ? (<Select
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
                  />):(<select name='school' className='form-select' value={user.userid} onLoad={handleInputChange}>
                    <option value={user.userid}>{user.firstname}</option>
                    </select>) }
                </div>
                <div className="col-md-6">
                <label htmlFor="teacherSchool" className="form-label">
                    <i className="fas fa-user-shield me-2"></i>Role
                  </label>
                <select className='form-select' name='role' onChange={handleInputChange} value={formData.role}>
                  <option value=''>Select Role</option>
                  <option value='School Manager'>School Manager</option>
                  <option value='Head of Teachers'>Head of Teachers</option>
                  <option value='Teacher'>Teacher</option>
                </select>
                </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="teacherPhoto" className="form-label">
                    <i className="fas fa-image me-2"></i>Upload Photo
                  </label>
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
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Teacher
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

export default ManageTeachers;