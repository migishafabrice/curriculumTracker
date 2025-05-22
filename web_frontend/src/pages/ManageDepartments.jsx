import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import EducationType from './EducationType';
import LevelType from './LevelType';
import SectionType from './SectionType';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import { Modal } from 'bootstrap';
import { getCurrentUser } from './AuthUser';
import { fetchDepartments } from './AppFunctions';
import axios from 'axios';

const ManageDepartments = () => {
  const user = getCurrentUser();
  const [activeComponent, setActiveComponent] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const departments = await fetchDepartments(user?.userid, user?.role);
      if (departments) {
        setDepartments(departments);
      } else {
        setNotification({ message: 'No departments found', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error fetching departments: ${error.message}`, type: 'error' });
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, []);

  const handleButtonClick = (component) => {
    setActiveComponent(component);
  };

  const handleCloseModal = () => {
    setActiveComponent(null);
  };

  useEffect(() => {
    if (activeComponent) {
      const modalId = `add${activeComponent}Modal`;
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
        modalElement.addEventListener("hidden.bs.modal", handleCloseModal);
      }
    }
  }, []);

  const showNotification = (message, type, shouldRefresh = false) => {
    setNotification({ message, type });
    if (shouldRefresh) {
      fetchData();
    }
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000);
  };

  const tableData = useMemo(() => {
    return departments.flatMap(eduType => 
      eduType.levels.flatMap(level => 
        level.sections.flatMap(section => ({
          id: `${eduType.code}-${level.code}-${section.code}`,
          educationType: eduType.name,
          educationTypeCode: eduType.code,
          educationLevel: level.name,
          educationLevelCode: level.code,
          section: section.name,
          sectionCode: section.code,
          classes: level.classes.join(', ')
        }))
      )
    );
  }, [departments]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;
    const searchLower = searchTerm.toLowerCase();
    return tableData.filter(item => 
      item.educationType.toLowerCase().includes(searchLower) ||
      item.educationLevel.toLowerCase().includes(searchLower) ||
      item.section.toLowerCase().includes(searchLower) ||
      item.classes.toLowerCase().includes(searchLower))
  }, [tableData, searchTerm]);

  const handleDeleteDepartment = async (type, code) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setIsLoading(true);
        let endpoint = '';
        if (type === 'education') endpoint = 'deleteEducationType';
        if (type === 'level') endpoint = 'deleteLevelType';
        if (type === 'section') endpoint = 'deleteSectionType';

        const response = await axios.delete(
          `http://localhost:5000/department/${endpoint}/${code}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (response.data.type === 'success') {
          showNotification(response.data.message, 'success', true);
          
        } else {
          showNotification(response.data.error, 'error');
          
        }
        setIsLoading(false);
      } catch (error) {
        showNotification(`Error deleting department: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    switch (user.role) {
      case "Administrator":
      case "Staff":
        return "Manage Departments";
      case "School":
        return "School Departments";
      case "Teacher":
        return "My Departments";
      default:
        return "Departments";
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
        <div id="departments-page" className="page">
          <div className="page-header">
            <h1 className="h2">{getPageTitle()}</h1>
            {(user.role === "Administrator" || user.role === "Staff") && (
              <div className="d-flex">
                <button 
                  className="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addModal"
                  onClick={() => handleButtonClick("EducationType")}
                  disabled={isLoading}
                >
                  <i className="fas fa-plus me-2"></i>Add Education Type
                </button>
                <button 
                  className="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addModal"
                  onClick={() => handleButtonClick("LevelType")}
                  disabled={isLoading}
                >
                  <i className="fas fa-plus me-2"></i>Add Level
                </button>
                <button 
                  className="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#addModal"
                  onClick={() => handleButtonClick("SectionType")}
                  disabled={isLoading}
                >
                  <i className="fas fa-plus me-2"></i>Add Option
                </button>
              </div>
            )}
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Department List</h5>
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
                          <th>Type</th>
                          <th>Level</th>
                          <th>Sections (Options)</th>
                          <th>Class (Promotion)</th>
                          {(user.role === "Administrator" || user.role === "Staff") && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((row, index) => (
                            <tr key={row.id}>
                              <td>
                                {index === 0 || row.educationType !== filteredData[index - 1].educationType 
                                  ? row.educationType 
                                  : ''}
                              </td>
                              <td>
                                {index === 0 || 
                                 row.educationLevel !== filteredData[index - 1].educationLevel || 
                                 row.educationType !== filteredData[index - 1].educationType
                                  ? row.educationLevel 
                                  : ''}
                              </td>
                              <td>{row.section}</td>
                              <td>{row.classes}</td>
                              {(user.role === "Administrator" || user.role === "Staff") && (
                                <td>
                                  <div className="action-buttons">
                                    <button className="btn btn-sm btn-outline-primary me-2">
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDeleteDepartment('section', row.sectionCode)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={user.role === "Administrator" || user.role === "Staff" ? 5 : 4} className="text-center">
                              No departments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Department Modals */}
       <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-black text-white">
                        <h5 className="modal-title" id="addEducationModalLabel">Add New
    {activeComponent === "EducationType" && " Education Type"}
    {activeComponent === "LevelType" && " Level Type"}
    {activeComponent === "SectionType" && " Section & Option Type"} 
                        </h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
               {/* Add Department */}
    {activeComponent === "EducationType" && <EducationType showNotification={showNotification} />}
    {activeComponent === "LevelType" && <LevelType showNotification={showNotification}/>}
    {activeComponent === "SectionType" && <SectionType showNotification={showNotification}/>}
              </div>
            </div>
         </div>    
    </>
  );
};

export default ManageDepartments;