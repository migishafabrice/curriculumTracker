import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Address from './Address';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import useLoadSchools from './useLoadSchools';
import { getCurrentUser } from './AuthUser';

const API_BASE_URL = 'http://localhost:5000';
const AVATAR_SIZE = '40px';

const initialFormState = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  school: "",
  photo: null,
  role: "",
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

const ManageTeachers = () => {
  const user = getCurrentUser();
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { schools } = useLoadSchools();
  const teachersPerPage = 10;

  const schoolOptions = useMemo(() => 
    schools.map(school => ({
      value: school.code,
      label: school.name
    }))
  , [schools]);

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = user?.role === 'School' ? { userid: user.userid } : {};
      const response = await axios.get(`${API_BASE_URL}/teacher/allTeachers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params
      });

      if (response.data.teachers && response.data.type === "success") {
        setTeachers(response.data.teachers);
      } else {
        setNotification({ message: response.data.message || 'Failed to fetch teachers', type: 'error' });
      }
      setIsLoading(false);
    } catch (error) {
      setNotification({ 
        message: `Error fetching teachers: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    if (!Array.isArray(teachers)) return [];
    
    return teachers.filter(teacher => {
      const searchLower = searchTerm.toLowerCase();
      const firstname = teacher?.firstname?.toLowerCase() || '';
      const lastname = teacher?.lastname?.toLowerCase() || '';
      const email = teacher?.email?.toLowerCase() || '';
      const phone = teacher?.telephone?.toLowerCase() || '';
      const school = schools.find(s => s.code === teacher.school)?.name.toLowerCase() || '';
      const status = teacher?.active === 1 ? 'active' : 'inactive';

      return (
        (firstname.includes(searchLower) || lastname.includes(searchLower)) &&
        (statusFilter === 'all' || status === statusFilter)
        && (firstname.includes(searchLower) || lastname.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower)) &&
        (statusFilter === 'all' || status === statusFilter) &&
        (school.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower))

      );
    });
  }, [teachers, searchTerm, statusFilter, schools]);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * teachersPerPage;
    return filteredTeachers.slice(startIndex, startIndex + teachersPerPage);
  }, [filteredTeachers, currentPage]);

  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  }, []);

  const handleAddressChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_ADDRESS', field, value });
  }, []);

  const handleFileChange = useCallback((e) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'photo', value: e.target.files[0] });
  }, []);

  const handleSchoolChange = useCallback((selectedOption) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'school',
      value: selectedOption ? selectedOption.value : ""
    });
  }, []);

  const validateForm = useCallback(() => {
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
      setNotification({ message: 'School is required', type: 'error' });
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const data = new FormData();
      data.append('firstname', formData.firstname);
      data.append('lastname', formData.lastname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('school', formData.school);
      data.append('role', formData.role);
      if (formData.photo) data.append('photo', formData.photo);

      const response = await axios.post(
        `${API_BASE_URL}/teacher/addTeacher`, 
        data, 
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
          } 
        }
      );

      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        await fetchTeachers();
        dispatch({ type: 'RESET' });
        document.getElementById('closeAddTeacherModal').click();
      } else {
        setNotification({ message: response.data.error, type: 'error' });
      }
      setIsLoading(false);
    } catch (error) {
      setNotification({ 
        message: `Error: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, user, validateForm, fetchTeachers]);

  const handleDeleteTeacher = useCallback(async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        setIsLoading(true);
        const response = await axios.delete(
          `${API_BASE_URL}/teacher/deleteTeacher/${teacherId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (response.data.type === 'success') {
          setNotification({ message: response.data.message, type: 'success' });
          await fetchTeachers();
        } else {
          setNotification({ message: response.data.error, type: 'error' });
        }
        setIsLoading(false);
      } catch (error) {
        setNotification({ 
          message: `Error deleting teacher: ${error.message}`, 
          type: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, fetchTeachers]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    switch(user.role) {
      case 'Administrator':
        return 'Manage Teachers';
      case 'School':
        return 'School Teachers';
      case 'Teacher':
        return 'Teacher Directory';
      default:
        return 'Teachers Management';
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
        <div id="teachers-page" className="page">
          <div className="page-header">
            <h1 className="h2">{getPageTitle()}</h1>
            <button 
              className="btn btn-primary"
              data-bs-toggle="modal" 
              data-bs-target="#addTeacherModal"
              disabled={isLoading}
            >
              <i className="fas fa-plus me-2"></i> Add New Teacher
            </button>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Teachers List</h5>
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
                <div className="input-group">
                  <span className="input-group-text"><i className="fas fa-filter"></i></span>
                  <select 
                    className="form-select" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                                      src={`${API_BASE_URL}${teacher.photo}`} 
                                      alt="Teacher" 
                                      className="avatar rounded-circle me-2"
                                      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                                      onError={(e) => e.target.src = '/default-avatar.png'}
                                    />
                                  ) : (
                                    <div 
                                      className="avatar-placeholder rounded-circle me-2 d-flex align-items-center justify-content-center"
                                      style={{ 
                                        width: AVATAR_SIZE, 
                                        height: AVATAR_SIZE,
                                        backgroundColor: '#f0f0f0',
                                        color: '#666'
                                      }}
                                    >
                                      {teacher.firstname?.charAt(0)}{teacher.lastname?.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-bold">
                                      {teacher.firstname} {teacher.lastname}
                                    </div>
                                    <small className="text-muted">{teacher.role}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{teacher.email}</td>
                              <td>{teacher.telephone}</td>
                              <td>
                                {schools.find(s => s.code === teacher.school)?.name || 'N/A'}
                              </td>
                              <td>
                                <span className={`badge ${teacher.active === 1 ? 'bg-success' : 'bg-warning'}`}>
                                  {teacher.active === 1 ? 'Active' : 'Inactive'}
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
                            <td colSpan="6" className="text-center">No teachers found</td>
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

      {/* Add Teacher Modal */}
      <div className="modal fade" id="addTeacherModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-black text-white">
              <h5 className="modal-title">Add New Teacher</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                id="closeAddTeacherModal"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        className="form-control"
                        id="teacherFirstName"
                        placeholder="First Name"
                        required
                        disabled={isLoading}
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
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        className="form-control"
                        id="teacherLastName"
                        placeholder="Last Name"
                        required
                        disabled={isLoading}
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
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        id="teacherEmail"
                        placeholder="Email"
                        required
                        disabled={isLoading}
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-control"
                        id="teacherPhone"
                        placeholder="Phone"
                        required
                        disabled={isLoading}
                      />
                      <label htmlFor="teacherPhone">
                        <i className="fas fa-phone me-2"></i>Phone
                      </label>
                    </div>
                  </div>
                </div>

                {user.role !== 'School' && (
                  <Address
                    address={formData.address}
                    onChange={handleAddressChange}
                    disabled={isLoading}
                  />
                )}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="teacherSchool" className="form-label">
                      <i className="fas fa-school me-2"></i>School
                    </label>
                    {user.role !== 'School' ? (
                      <Select
                        id="teacherSchool"
                        classNamePrefix="select"
                        placeholder="Select School"
                        options={schoolOptions}
                        value={schoolOptions.find(option => option.value === formData.school) || null}
                        onChange={handleSchoolChange}
                        isDisabled={isLoading}
                        required
                      />
                    ) : (
                      <select 
                        name="school" 
                        className="form-select" 
                        value={user.userid} 
                        disabled
                      >
                        <option value={user.userid}>{user.firstname}</option>
                      </select>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="teacherRole" className="form-label">
                      <i className="fas fa-user-shield me-2"></i>Role
                    </label>
                    <select 
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="School Manager">School Manager</option>
                      <option value="Head of Teachers">Head of Teachers</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="teacherPhoto" className="form-label">
                    <i className="fas fa-image me-2"></i>Upload Photo
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    id="teacherPhoto"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
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