import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import Sidebar from './Sidebar';
import useLoadSchools from './useLoadSchools';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import Address from './Address';
import { getCurrentUser } from './AuthUser'; 
import {fetchEducationTypes,fetchLevelTypes,fetchSectionTypes} from './CurriculumFunctions';
const user=getCurrentUser(); 
// Define initial form data and reducer outside the component
const initialFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  school: user?.role==="School" ? user.userid : "",
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

const ManageCourses = () => {
  const [teachers, setTeachers] = useState([]);
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { schools, notice, loadSchools } = useLoadSchools();
  const [educationTypes, setEducationTypes] = useState([]);
  const [levelTypes,setLevelTypes]=useState([]);
  const [sectionTypes,setSectionTypes]=useState([]);
  const coursesPerPage = 10;

  const schoolOptions = useMemo(() => 
    schools.map((school) => ({
      value: school.code, 
      label: school.name, 
    }))
  , [schools]);
useEffect(() => {
  const loadEducationTypes = async () => {
    try {
      
    const types = await fetchEducationTypes(user?.role==="School" ? user.userid : "");
    setEducationTypes(types.map(({code,name})=>
    (
      {
      value:code,
      label:name
      }
    )
    ));
    } catch (err) {
      setNotification({ message: 'Failed to fetch education types', type: 'error' });
      console.error("Failed to fetch education types:", err);
    } finally {
      setIsLoading(false);
    }
  };

  loadEducationTypes();
}, []);

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

  // Load schools and courses on mount
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
            setTeachers(
            Array.isArray(response.data.teachers)
              ? response.data.teachers.map((teacher) => ({
                value: teacher.code,
                label: `${teacher.firstname} ${teacher.lastname}`,
              }))
              : []
            );
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
  const fetchCourses = async () => {
    try {
      let response;
      if (user.role === 'School') {
        response = await axios.get('http://localhost:5000/course/allCourses', {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { userid: user.userid }
        });
      } else {
        response = await axios.get('http://localhost:5000/course/allCourses', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
  
      if (response.data.courses && response.data.type === "success") {
        setCourses(Array.isArray(response.data.courses) ? response.data.courses : []);
      } else if (response.data.type === "error") {
        setNotification({ message: response.data.message, type: "error" });
      }
    } catch (error) {
      setNotification({ 
        message: `Error fetching courses: ${error.message}`, 
        type: 'error' 
      });
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    // Add additional type checking to be safe
    if (!Array.isArray(courses)) return [];
    
    return courses.filter(course => {
      // Add null checks for course properties
      const firstname = course?.firstname?.toLowerCase() || '';
      const lastname = course?.lastname?.toLowerCase() || '';
      const status = course?.status || '';
      
      const matchesSearch = firstname.includes(searchTerm.toLowerCase()) || 
                          lastname.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage]);
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page when courses list changes
  }, [courses]);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

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
const handleEducationType=async(education_type)=>
{
const levels=await fetchLevelTypes(education_type, user.role==="School" ? user.userid : "");

setLevelTypes(levels.map(({code,name})=>
(
  {
    value:code,
    label:name
  }
)))
}
const handleLevelType=async(level_type)=>
{
const sections=await fetchSectionTypes(level_type.value);
setSectionTypes(sections.map(({code,name})=>
(
  {
    value:code,
    label:name
  }
)
))
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
        'http://localhost:5000/course/addCourse', 
        data, 
        { headers: { 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
         
        } }
      );

      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        await fetchCourses();
        dispatch({ type: 'RESET' });
        document.getElementById('closeAddCourseModal').click();
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

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/course/deleteCourse/${courseId}`
        );
        if (response.data.type === 'success') {
          setNotification({ message: response.data.message, type: 'success' });
          await fetchCourses();
        }
      } catch (error) {
        setNotification({ 
          message: `Error deleting course: ${error.message}`, 
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
        <div id="courses-page" className="page">
          <div className="page-header">
            <h1 className="h2">Assigned Courses</h1>
            <div>
              <button 
                className="btn btn-primary" 
                data-bs-toggle="modal" 
                data-bs-target="#addCourseModal"
              >
                <i className="fas fa-plus"></i> Assign New Course
              </button>
            </div>
          </div>
                    
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Courses List</h5>
            </div>
            <div className="d-flex justify-content-end align-items-center mt-4 mb-3 pe-3" 
                 style={{ width: "60%", marginLeft: "auto" }}>
              {/* Search Input */}
              <div className="input-group me-2">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="courseSearch" 
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
                          
                          <th>Course</th>
                          <th>Email</th>
                          <th>Contact</th>
                          <th>School</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCourses.length > 0 ? (
                          paginatedCourses.map((course) => (
                            <tr key={course._id}>
                              
                              <td>
                                <div className="d-flex align-items-center">
                                  {course.photo ? (
                                    <img 
                                    src={`http://localhost:5000${course.photo}`} 
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
                                      {course.firstname.charAt(0)}{course.lastname.charAt(0)}
                                    </div>
                                  )}
                                  <div className="ms-2">
                                    <div className="fw-bold">
                                      {course.firstname} {course.lastname}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{course.email}</td>
                              <td>{course.telephone}</td>
                              <td>
                                {schools.find(s => s.code === course.school)?.name || 'N/A'}
                              </td>
                              <td>
                                <span className={`badge ${course.status === 'active' ? 'bg-success' : 'bg-warning'} status-badge`}>
                                  {course.status === 'active' ? 'Active' : 'On Leave'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-2">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteCourse(course._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">No courses found</td>
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
    
      {/* Modal to add new course */}
      <div className="modal fade" id="addCourseModal" tabIndex="-1" aria-labelledby="addCourseModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="addCourseModalLabel">Assign Course</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                id="closeAddCourseModal"
              ></button>
            </div>
            <div className="modal-body">
              <form id="courseForm" onSubmit={handleSubmit}>
                <div className="row mb-3">
                  
                  
                </div>
                {/* <div className="mb-4 border-top pt-1"> */}
                  {/* <h5 className="mb-3">School Sections</h5> */}
                  
                  <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="CourseCategory">
                      <i className="fas fa-tags me-2"></i>Education Type
                    </label>
                    <div className="mb-3">
                      <Select
                        id="CourseCategory"
                        isClearable={true}
                        options={educationTypes}
                        onChange={(selected) => handleEducationType(selected.value)}
                        // value={educationTypes.find(opt => opt.value === formData.education_type)}
                        placeholder="Select Education Type"
                        required
                      />
                    </div>
                  </div>
                    <div className="col-md-4">
                      <label htmlFor="CourseTitle">
                        <i className="fas fa-level-up-alt me-2"></i>Education Level
                      </label>
                      <div className="mb-3">
                        <Select
                          id="CourseGrade"
                          isClearable={true}
                          options={levelTypes}
                          onChange={(selected) => handleLevelType( selected)}
                          placeholder="Select Level"
                          // value={levelTypes.find(opt => opt.value === currentSection.level)}
                        />
                      </div>
                    </div>
                   
                    <div className="col-md-4">
                      <label htmlFor="CourseSection">
                        <i className="fas fa-th-large me-2"></i>Education Section | Option
                      </label>
                      <div className="mb-3">
                        <Select
                          id="CourseSection"
                          isClearable={true}
                          options={sectionTypes}
                          // onChange={(selected) => handleSelectChange("option", selected)}
                          placeholder="Select Option"
                          // value={sectionTypes.find(opt => opt.value === currentSection.option)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input 
                        type="text" 
                        name='firstname' 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="form-control" 
                        id="courseFirstName" 
                        placeholder="First Name"
                        required
                      />
                      <label htmlFor="courseFirstName">
                        <i className="fas fa-user me-2"></i>Course Name
                      </label>
                    </div>
                  </div>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      // onClick={handleAddSection}
                      // disabled={!currentSection.level || !formData.education_type}
                    >
                      <i className="fas fa-plus me-2"></i>Add to School Sections
                    </button>
                  </div>

                  {/* {sections.length > 0 && (
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
                  )} */}
                {/* </div> */}
                
                {user.role!=='School' && <Address
                  address={formData.address} 
                  onChange={handleAddressChange} 
                />}
                
                <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="courseSchool" className="form-label">
                    <i className="fas fa-school me-2"></i>School
                  </label>
                  {user.role!=='School' ? (<Select
                    id="courseSchool"
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
                <label htmlFor="courseSchool" className="form-label">
                    <i className="fas fa-user-shield me-2"></i>Teacher
                  </label>
                  <Select
                    id="courseTeacher"
                    name='teacher'
                    classNamePrefix="select"
                    placeholder="Select Teacher"
                    isClearable={true} 
                    isSearchable={true} 
                    options={teachers} 
                    value={teachers.find(option => option.value === formData.teacher) || null}
                    onChange={(selectedOption) => {
                      dispatch({ type: 'UPDATE_FIELD', field: 'teacher', value: selectedOption ? selectedOption.value : "" });
                    }}/>
                </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="coursePhoto" className="form-label">
                    <i className="fas fa-image me-2"></i>Upload Photo
                  </label>
                  <input 
                    className="form-control" 
                    name='photo' 
                    onChange={handleFileChange} 
                    type="file" 
                    id="coursePhoto"
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
                    Save Course
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

export default ManageCourses;