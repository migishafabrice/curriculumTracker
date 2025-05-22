import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
//import useLoadSchools from './useLoadSchools';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import { getCurrentUser } from './AuthUser';
import { fetchEducationTypes, fetchLevelTypes, fetchSectionTypes, fetchClassTypes, fetchCourseTypes, fetchCoursesAssigned } from './AppFunctions';

const initialFormData = {
  teacher: "",
  selectedCourses: [],
  education_type_code: "",
  level_type_code: "",
  section_type_code: "",
  class_type_code: "",
  course_type_code: "",
  school: ""
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
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
        selectedCourses: state.selectedCourses.filter((_, index) => index !== action.index)
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
 // const { schools } = useLoadSchools();
  const [educationTypes, setEducationTypes] = useState([]);
  const [levelTypes, setLevelTypes] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [classTypes, setClassTypes] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const coursesPerPage = 10;

  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const [assignedCourses, teacherList, eduTypes] = await Promise.all([
          fetchCoursesAssigned(user.userid, user.role),
          fetchTeachers(),
          fetchEducationTypes(user?.role === "School" ? user.userid : "")
        ]);
        
        setCourses(assignedCourses || []);
        setTeachers(teacherList);
        setEducationTypes(eduTypes.map(({ code, name }) => ({ value: code, label: name })));
        setIsLoading(false);
      } catch (error) {
        setNotification({ message: error.message, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    return courses.filter(course => {
      const searchLower = searchTerm.toLowerCase();
      const teacherName = course?.teacher?.toLowerCase() || '';
      const educationType = course?.education_name?.toLowerCase() || '';
      const level = course?.level_name?.toLowerCase() || '';
      const section = course?.section_name?.toLowerCase() || '';
      const classType = course?.class_name?.toLowerCase() || '';
      const schoolName = course?.school?.toLowerCase() || '';
      const courseName = course?.name?.toLowerCase() || '';
      const courseCode = course?.code?.toLowerCase() || '';
      return teacherName.includes(searchLower) || 
             schoolName.includes(searchLower) || 
             educationType.includes(searchLower) ||
             level.includes(searchLower) ||
             section.includes(searchLower) ||
             classType.includes(searchLower) ||
             courseName.includes(searchLower) ||
             courseCode.includes(searchLower);
    });
  }, [courses, searchTerm]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const fetchTeachers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/teacher/allTeachers', {
      headers: { Authorization: `Bearer ${user.token}` },
      params: user.role === 'School' ? { userid: user.userid } : {}
    });

    if (response.data.teachers && response.data.type === "success") {
      return response.data.teachers.map(teacher => ({
        value: teacher.code,
        label: `${teacher.firstname} ${teacher.lastname}`,
      }));
    }
      return [];
    } catch (error) {
      setNotification({ message: `Error fetching teachers: ${error.message}`, type: "error" });
      return [];
    }
  };
  
    const handleEducationType = async (education_type) => {
      const levels = await fetchLevelTypes(education_type, user.role === "School" ? user.userid : "");
      setLevelTypes(levels.map(({ code, name }) => ({ value: code, label: name })));
      dispatch({ type: 'UPDATE_FIELD', field: 'education_type_code', value: education_type });
    };

  const handleLevelType = async (level_type) => {
    const sections = await fetchSectionTypes(level_type, user.role === "School" ? user.userid : "");
    setSectionTypes(sections.map(({ code, name }) => ({ value: code, label: name })));
    dispatch({ type: 'UPDATE_FIELD', field: 'level_type_code', value: level_type });
  };

  const handleSectionType = async (section_type) => {
    const classes = await fetchClassTypes(formData.level_type_code);
    setClassTypes(classes.map(cls => ({ value: cls, label: cls })));
    dispatch({ type: 'UPDATE_FIELD', field: 'section_type_code', value: section_type });
  };

  const handleClassType = async (class_type) => {
    const courses = await fetchCourseTypes(
      formData.education_type_code,
      formData.level_type_code,
      formData.section_type_code,
      class_type,
    );
    setCourseTypes(courses.map(({ code, name }) => ({ value: code, label: name })));
    dispatch({ type: 'UPDATE_FIELD', field: 'class_type_code', value: class_type });
  };

  const handleAddCourse = async (course_type) => {
    if (!course_type) return;
    
    const selectedCourse = courseTypes.find(c => c.value === course_type);
    if (!selectedCourse) return;
  
    if (formData.selectedCourses.some(c => c.code === selectedCourse.value)) {
      setNotification({ message: 'This course is already selected', type: 'error' });
      return;
    }

    const newCourse = {
      code: selectedCourse.value,
      name: selectedCourse.label,
      educationType: educationTypes.find(et => et.value === formData.education_type_code)?.label || 'N/A',
      level: levelTypes.find(lt => lt.value === formData.level_type_code)?.label || 'N/A',
      section: sectionTypes.find(st => st.value === formData.section_type_code)?.label || 'N/A',
      class: formData.class_type_code
    };
  
    dispatch({ type: 'ADD_COURSE', course: newCourse });
  };

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
          courses: formData.selectedCourses.map(c => ({ code: c.code })),
          school: user.role === "School" ? user.userid : formData.school
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
        const assignedCourses = await fetchCoursesAssigned(user.userid, user.role);
        setCourses(assignedCourses || []);
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
          const assignedCourses = await fetchCoursesAssigned(user.userid, user.role);
          setCourses(assignedCourses || []);
        }
      } catch (error) {
        setNotification({ message: `Error deleting assignment: ${error.message}`, type: 'error' });
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
        <ToastMessage message={notification.message} type={notification.type} />
      )}
      <Sidebar />
      <div className="page-content">
        <div id="courses-page" className="page">
          <div className="page-header">
            <h1 className="h2">
              { user.role==="Teacher" && ('My Courses')}
              { user.role==="School" && ('Manage School Courses') }
              { user.role==="Admin" && ('Manage Assigned Courses') }
            </h1>
            {user.role === "School" && (
              <button 
                className="btn btn-primary" 
                data-bs-toggle="modal" 
                data-bs-target="#addCourseModal"
              >
                <i className="fas fa-plus"></i> Assign Courses
              </button>
            )}
          </div>
                    
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Course Assignments</h5>
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
            
            <div className="card-body p-1 ">
                {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Name</th>
                          <th>Education Type</th>
                          <th>Level</th>
                          <th>Section</th>
                          <th>Class (Promotion)</th>
                          {user.role !== "Teacher" && (<th>Teacher</th>)}
                          {user.role !== "Teacher" && (<th>School</th>)}
                          {(user.role === "School" ) && (<th>Actions</th>)}
                          

                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCourses.length > 0 ? (
                          paginatedCourses.map((assignment) => (
                            <tr key={assignment.code}>
                              <td>
                                {assignment.name && assignment.code && (
                                  <span key={assignment.code} className="badge bg-primary me-1 mb-1 fs-6">
                                    {assignment.code }
                                  </span>
                                ) || 'No courses assigned'}
                              </td>
                               <td>
                                  <span className="badge bg-success me-1 mb-1 fs-6">
                                    {assignment.name || 'N/A'}</span>
                                </td>
                                <td>
                                  {assignment.education_name || 'N/A'}
                                </td>
                                <td>
                                  {assignment.level_name || 'N/A'}
                                </td>
                                <td>
                                  {assignment.section_name || 'N/A'}
                                </td>
                                <td>
                                {assignment.class_name || 'N/A'}
                                </td>
                              {user.role !== "Teacher" && (
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="ms-2">
                                      <div className="fw-bold">
                                        {assignment.teacher || 'Unknown Teacher'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              )}
                              {user.role !== "Teacher" && (
                              <td>assignment.school</td>) 
                              }
                              
                              {(user.role === "School" ) && (
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteAssignment(assignment.code)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>)}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td 
                              colSpan={user.role === "Teacher" ? 6 :
                                 user.role === "School" ? 9 : 
                                (user.role === "Administrator" || user.role==="Satff") && 8 }
                              className="text-center"
                            >
                              No course assignments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div> )}
                  
                  {totalPages > 1 && (
                    <nav>
                      <ul className="pagination justify-content-end">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                            Previous
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    
      {/* Add Course Modal */}
      <div className="modal fade" id="addCourseModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-black text-white">
              <h5 className="modal-title">Assign Courses</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                id="closeAddCourseModal"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Teacher</label>
                    <Select
                      classNamePrefix="select"
                      placeholder="Select Teacher"
                      options={teachers}
                      value={teachers.find(option => option.value === formData.teacher) || null}
                      onChange={(selected) => dispatch({ 
                        type: 'UPDATE_FIELD', 
                        field: 'teacher', 
                        value: selected ? selected.value : "" 
                      })}
                      required
                    />
                  </div>
                </div>
                
                <h5>Select Course Information</h5>
                <hr/>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label>Education Type</label>
                    <Select
                      options={educationTypes}
                      onChange={(selected) => handleEducationType(selected.value)}
                      value={educationTypes.find(opt => opt.value === formData.education_type_code)}
                      placeholder="Select Education Type"
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Education Level</label>
                    <Select
                      options={levelTypes}
                      onChange={(selected) => handleLevelType(selected.value)}
                      value={levelTypes.find(opt => opt.value === formData.level_type_code)}
                      placeholder="Select Level"
                      isDisabled={!formData.education_type_code}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label>Education Section</label>
                    <Select
                      options={sectionTypes}
                      onChange={(selected) => handleSectionType(selected.value)}
                      value={sectionTypes.find(opt => opt.value === formData.section_type_code)}
                      placeholder="Select Option"
                      isDisabled={!formData.level_type_code}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Education Class</label>
                    <Select
                      options={classTypes}
                      onChange={(selected) => handleClassType(selected.value)}
                      value={classTypes.find(opt => opt.value === formData.class_type_code)}
                      placeholder="Select Class"
                      isDisabled={!formData.section_type_code}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <label>Course</label>
                    <Select
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

                {formData.selectedCourses.length > 0 && (
                  <div className="mb-4">
                    <h5>Selected Courses</h5>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.selectedCourses.map((course, index) => (
                            <tr key={index}>
                              <td>{course.code}</td>
                              <td>{course.name}</td>
                              <td>
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => dispatch({ type: 'REMOVE_COURSE', index })}
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
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
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