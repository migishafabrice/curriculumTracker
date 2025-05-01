import React, { useState, useEffect,  useReducer, useMemo } from 'react';
import { replace, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import useLoadSchools from './useLoadSchools';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import Address from './Address';
import { getCurrentUser } from './AuthUser'; 
import {fetchEducationTypes,fetchLevelTypes,fetchSectionTypes,fetchClassTypes,fetchCourseTypes} from './AppFunctions';

const user = getCurrentUser(); 

// Updated initial form data structure
const initialFormData = {
  teacher: "",
  selectedCourses: [], // Array to store all selected courses with their full info
  education_type_code: "",
  level_type_code: "",
  section_type_code: "",
  class_type_code: "",
  course_type_code: "",
  school: user?.role === "School" ? user.userid : "",
  address: {
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  }
};

// Updated reducer to handle course operations
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_ADDRESS':
      return { 
        ...state, 
        address: { ...state.address, [action.field]: action.value } 
      };
    case 'ADD_COURSE':
      return {
        ...state,
        selectedCourses: [...state.selectedCourses, action.course],
        education_type_code: "",
        level_type_code: "",
        section_type_code: "",
        class_type_code: "",
        course_type_code: ""
      };
    case 'REMOVE_COURSE':
      return {
        ...state,
        selectedCourses: state.selectedCourses.filter(
          (course, index) => index !== action.index
        )
      };
    case 'RESET':
      return initialFormData;
    default:
      return state;
  }
};

const ManageCourses = () => {
  const Navigate = useNavigate();
  
  if (!user) {
    Navigate("/login", replace);
  }

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
  const [levelTypes, setLevelTypes] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [classTypes, setClassTypes] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const coursesPerPage = 10;

 

  // Load education types on mount
  useEffect(() => {
    const loadEducationTypes = async () => {
      try {
        const types = await fetchEducationTypes(user?.role === "School" ? user.userid : "");
        setEducationTypes(types.map(({code, name}) => ({
          value: code,
          label: name
        })));
      } catch (err) {
        setNotification({ message: 'Failed to fetch education types', type: 'error' });
        console.error("Failed to fetch education types:", err);
      }
    };

    loadEducationTypes();
  }, []);

  // Notification handling
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

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      await loadSchools();
      await fetchTeachers();
      await fetchCourses();
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
        response = await axios.get('http://localhost:5000/course/assignments', {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { userid: user.userid }
        });
      } else {
        response = await axios.get('http://localhost:5000/course/assignments', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
  
      if (response.data.assignments && response.data.type === "success") {
        setCourses(Array.isArray(response.data.assignments) ? response.data.assignments : []);
      } else if (response.data.type === "error") {
        setNotification({ message: response.data.message, type: "error" });
      }
    } catch (error) {
      setNotification({ 
        message: `Error fetching course assignments: ${error.message}`, 
        type: 'error' 
      });
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and pagination logic remains the same
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    return courses.filter(course => {
      const teacherName = course?.teacherName?.toLowerCase() || '';
      const status = course?.status || '';
      
      const matchesSearch = teacherName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [courses]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Handlers for education type selection
  const handleEducationType = async (education_type) => {
    const levels = await fetchLevelTypes(education_type, user.role === "School" ? user.userid : "");
    setLevelTypes(levels.map(({code, name}) => ({
      value: code,
      label: name
    })));
    dispatch({ type: 'UPDATE_FIELD', field: 'education_type_code', value: education_type });
  };

  const handleLevelType = async (level_type) => {
    const sections = await fetchSectionTypes(level_type, user.role === "School" ? user.userid : "");
    setSectionTypes(sections.map(({code, name}) => ({
      value: code,
      label: name
    })));
    setClassTypes([]);
    const allClasses = sections.flatMap(item => 
      item.classes 
        ? item.classes.split(',').map(c => c.trim())
        : []
    );
    setClassTypes(allClasses.map((item) => ({
      value: item,
      label: item,
    })));
    dispatch({ type: 'UPDATE_FIELD', field: 'level_type_code', value: level_type });
  };

  const handleSectionType = async (section_type) => {
    const cl = await fetchClassTypes(formData.level_type_code);
    const allClasses = cl.flatMap(item => 
      item.classes 
        ? item.classes.split(',').map(c => c.trim())
        : []
    );
    
    const classArray = typeof allClasses === 'string' 
      ? allClasses.split(',').map(c => c.trim()).filter(c => c)
      : Array.isArray(allClasses)
        ? allClasses.map(c => String(c).trim()).filter(c => c)
        : [];
    
    setClassTypes(classArray.map(classe => ({
      value: classe,
      label: classe
    })));
    dispatch({ type: 'UPDATE_FIELD', field: 'section_type_code', value: section_type });
  };

  const handleClassType = async (class_type) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'class_type_code', value: class_type });
    const courses = await fetchCourseTypes(
      formData.education_type_code,
      formData.level_type_code,
      formData.section_type_code,
      class_type,
    );
    setCourseTypes(courses.map(({code, name}) => ({
      value: code,
      label: name
    })));
  }; 

  const handleAddCourse = async (course_type) => {
    if (!course_type) return;
    
    const selectedCourse = courseTypes.find(c => c.value === course_type);
    if (!selectedCourse) return;
  
    // Check if course is already selected
    if (formData.selectedCourses.some(c => c.code === selectedCourse.value)) {
      setNotification({ message: 'This course is already selected', type: 'error' });
      return;
    }
    // Get education path info for the selected course
    const educationType = educationTypes.find(et => et.value === formData.education_type_code);
    const levelType = levelTypes.find(lt => lt.value === formData.level_type_code);
    const sectionType = sectionTypes.find(st => st.value === formData.section_type_code);
  
    const newCourse = {
      code: selectedCourse.value,
      name: selectedCourse.label,
      educationType: educationType?.label || 'N/A',
      level: levelType?.label || 'N/A',
      section: sectionType?.label || 'N/A',
      class: formData.class_type_code
    };
  
    dispatch({ type: 'ADD_COURSE', course: newCourse });
    dispatch({ type: 'UPDATE_FIELD', field: 'education_type_code', value: "" });
    dispatch({ type: 'UPDATE_FIELD', field: 'level_type_code', value: "" });
    dispatch({ type: 'UPDATE_FIELD', field: 'section_type_code', value: "" });
    dispatch({ type: 'UPDATE_FIELD', field: 'class_type_code', value: "" });
    dispatch({ type: 'UPDATE_FIELD', field: 'course_type_code', value: "" });
    
    // Clear the dropdown options
    formData.education_type_code = "";
    formData.level_type_code = "";
    formData.section_type_code = "";
    formData.class_type_code = "";
    formData.course_type_code = "";
    setLevelTypes([]);
    setSectionTypes([]);
    setClassTypes([]);
    setCourseTypes([]);
  };

  // Handler for removing a course from selection
  const handleRemoveCourse = (index) => {
    dispatch({ type: 'REMOVE_COURSE', index });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teacher) {
      setNotification({ message: 'Teacher is required', type: 'error' });
      return;
    }
    
    if (formData.selectedCourses.length === 0) {
      setNotification({ message: 'At least one course must be selected', type: 'error' });
      return;
    }

    try {
      
      const response = await axios.post(
        'http://localhost:5000/curriculum/assignCurriculum', 
        {
          teacherCode: formData.teacher,
          courses: formData.selectedCourses.map(c => ({
        code: c.code,
            })),
          school: formData.school
        },
        { 
          headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
          }
        }
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

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/course/deleteAssignment/${assignmentId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (response.data.type === 'success') {
          setNotification({ message: response.data.message, type: 'success' });
          await fetchCourses();
        }
      } catch (error) {
        setNotification({ 
          message: `Error deleting assignment: ${error.message}`, 
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
                <i className="fas fa-plus"></i> Assign Courses
              </button>
            </div>
          </div>
                    
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Course Assignments</h5>
            </div>
            <div className="d-flex justify-content-end align-items-center mt-4 mb-3 pe-3" 
                 style={{ width: "60%", marginLeft: "auto" }}>
              <div className="input-group me-2">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="courseSearch" 
                  placeholder="Search by teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            
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
                  <option value="inactive">Inactive</option>
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
                          <th>Assigned Courses</th>
                          <th>School</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCourses.length > 0 ? (
                          paginatedCourses.map((assignment) => (
                            <tr key={assignment._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {assignment.teacherPhoto ? (
                                    <img 
                                      src={`http://localhost:5000${assignment.teacherPhoto}`} 
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
                                      {assignment.teacherName?.charAt(0) || 'T'}
                                    </div>
                                  )}
                                  <div className="ms-2">
                                    <div className="fw-bold">
                                      {assignment.teacherName || 'Unknown Teacher'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {assignment.courses?.map(course => (
                                  <span key={course.code} className="badge bg-primary me-1 mb-1">
                                    {course.name}
                                  </span>
                                )) || 'No courses assigned'}
                              </td>
                              <td>
                                {schools.find(s => s.code === assignment.school)?.name || 'N/A'}
                              </td>
                              <td>
                                <span className={`badge ${assignment.status === 'active' ? 'bg-success' : 'bg-warning'} status-badge`}>
                                  {assignment.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-2">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteAssignment(assignment._id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">No course assignments found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination remains the same */}
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
    
      {/* Modal to add new course assignments */}
      <div className="modal fade" id="addCourseModal" tabIndex="-1" aria-labelledby="addCourseModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-black text-white">
              <h5 className="modal-title" id="addCourseModalLabel">Assign Courses</h5>
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
                  <div className="col-md-12">
                    <label htmlFor="courseTeacher" className="form-label">
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
                      }}
                      required
                    />
                  </div>
                </div>
                
                <h5>Select Course Information</h5>
                <hr/>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="CourseCategory">
                      <i className="fas fa-tags me-2"></i>Education Type
                    </label>
                    <div className="mb-3">
                      <Select
                        id="CourseCategory"
                        isClearable={true}
                        options={educationTypes}
                        onChange={(selected) => handleEducationType(selected.value)}
                        value={educationTypes.find(opt => opt.value === formData.education_type_code)}
                        placeholder="Select Education Type"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="CourseGrade">
                      <i className="fas fa-level-up-alt me-2"></i>Education Level
                    </label>
                    <div className="mb-3">
                      <Select
                        id="CourseGrade"
                        isClearable={true}
                        options={levelTypes}
                        onChange={(selected) => handleLevelType(selected.value)}
                        value={levelTypes.find(opt => opt.value === formData.level_type_code)}
                        placeholder="Select Level"
                        isDisabled={!formData.education_type_code}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="CourseSection">
                      <i className="fas fa-th-large me-2"></i>Education Section | Option
                    </label>
                    <div className="mb-3">
                      <Select
                        id="CourseSection"
                        isClearable={true}
                        options={sectionTypes}
                        onChange={(selected) => handleSectionType(selected.value)}
                        value={sectionTypes.find(opt => opt.value === formData.section_type_code)}
                        placeholder="Select Option"
                        isDisabled={!formData.level_type_code}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="CourseClass">
                      <i className="fas fa-th-large me-2"></i>Education Class
                    </label>
                    <div className="mb-3">
                      <Select
                        id="CourseClass"
                        isClearable={true}
                        options={classTypes}
                        onChange={(selected) => handleClassType(selected.value)}
                        value={classTypes.find(opt => opt.value === formData.class_type_code)}
                        placeholder="Select Class"
                        isDisabled={!formData.section_type_code}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <label htmlFor="courseName">
                      <i className="fas fa-book me-2"></i>Course
                    </label>
                    <div className="mb-3">
                      <Select
                        id="courseName"
                        isClearable={true}
                        options={courseTypes}
                        onChange={(selected) => dispatch({ 
                          type: 'UPDATE_FIELD', 
                          field: 'course_type_code', 
                          value: selected ? selected.value : "" 
                        })}
                        value={courseTypes.find(opt => opt.value === formData.course_type_code)}
                        placeholder="Select Course"
                        isDisabled={!formData.class_type_code}
                      />
                    </div>
                  </div>
                  
                </div>
                <div className="row mb-3">
  <div className="col-12 d-flex justify-content-center">
    <div className="col-md-6">
      <button 
        type="button" 
        className="btn btn-primary w-100"
        onClick={() => handleAddCourse(formData.course_type_code)}
        disabled={!formData.course_type_code}
      >
        <i className="fas fa-plus me-2"></i>Add Course
      </button>
    </div>
  </div>
</div>


                {/* Selected Courses Table */}
                {formData.selectedCourses.length > 0 && (
                  <div className="mb-4">
                    <h5>Selected Courses</h5>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Education Path</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.selectedCourses.map((course, index) => (
                            <tr key={index}>
                              <td>{course.code}</td>
                              <td>{course.name}</td>
                              <td>
                                {course.educationType} &gt; {course.level} &gt; {course.section} &gt; {course.class}
                              </td>
                              <td>
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveCourse(index)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                 <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    
                  >
                    Save Assignments
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