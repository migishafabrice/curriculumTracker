import React, { useState,useEffect } from 'react'
import Sidebar from './Sidebar';
import useLoadSchools from './useLoadSchools';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
const ManageTeachers=()=>
{
     const [notification, setNotification] = useState({ message: null, type: null });
    const { schools, notice, loadSchools } = useLoadSchools();
    const[formData,setFormData]=useState(
    {
        firstname:"",
        lastname:"",
        email:"",
        phone:"",
        school:"",
        photo:null,
    });
    const schoolOptions = schools.map((school) => ({
        value: school.code, 
        label: school.name, 
      }));
  useEffect(() => {
    if (notice) {
      setNotification(notice);
    }
  }, [notice]);
  // Load schools when the component mounts
  useEffect(() => {
    loadSchools();
  }, [loadSchools]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'school') {
        setFormData({ ...formData, [name]: value });
      }
  };
  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };
  const handleSchoolChange = (selectedOption) => {
    setFormData({
      ...formData,
      school: selectedOption ? selectedOption.value : "",
    });
  };  
  const handleSubmit=async(e)=>
  {
    e.preventDefault();
    try{
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    const response = await axios.post('http://localhost:5000/teacher/addTeacher', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.type === 'success') {
      setNotification({ message: response.data.message, type: 'success' });
    //   loadSchools();
    //   resetForm();
    } else {
      setNotification({ message: response.data.error, type: 'error' });
    }
  } catch (error) {
    setNotification({ message: `Error: ${error.message}`, type: 'error' });
  }
    
    
  }
    return(
        <>
           {/* <!--Add side content--> */}
           {notification.message && <ToastMessage message={notification.message} type={notification.type} />}
           <Sidebar/>
            {/* <!-- Content --> */}
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
                            {/* <!-- Search Input --> */}
                            <div className="input-group me-2">
                                <span className="input-group-text"><i className="fas fa-search"></i></span>
                                <input type="text" className="form-control" id="teacherSearch" placeholder="Search by name..."/>
                            </div>
                        
                            {/* <!-- Filter Dropdown --> */}
                            <div className="input-group">
                                <span className="input-group-text"><i className="fas fa-filter"></i></span>
                                <select className="form-select" id="filterStatus">
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Teacher</th>
                                            <th>Subject</th>
                                            <th>Contact</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>001</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src="/api/placeholder/40/40" alt="Avatar" className="avatar"/>
                                                    <div>
                                                        <div className="fw-bold">John Smith</div>
                                                        <div className="small text-muted">john.smith@edumanage.com</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>Mathematics</td>
                                            <td>(555) 123-4567</td>
                                            <td><span className="badge bg-success status-badge">Active</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>002</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src="/api/placeholder/40/40" alt="Avatar" className="avatar"/>
                                                    <div>
                                                        <div className="fw-bold">Emily Johnson</div>
                                                        <div className="small text-muted">emily.johnson@edumanage.com</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>English</td>
                                            <td>(555) 234-5678</td>
                                            <td><span className="badge bg-success status-badge">Active</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>003</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src="/api/placeholder/40/40" alt="Avatar" className="avatar"/>
                                                    <div>
                                                        <div className="fw-bold">Michael Chen</div>
                                                        <div className="small text-muted">michael.chen@edumanage.com</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>Science</td>
                                            <td>(555) 345-6789</td>
                                            <td><span className="badge bg-success status-badge">Active</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>004</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src="/api/placeholder/40/40" alt="Avatar" className="avatar"/>
                                                    <div>
                                                        <div className="fw-bold">Lisa Rodriguez</div>
                                                        <div className="small text-muted">lisa.rodriguez@edumanage.com</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>Social Studies</td>
                                            <td>(555) 456-7890</td>
                                            <td><span className="badge bg-warning status-badge">On Leave</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>005</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src="/api/placeholder/40/40" alt="Avatar" className="avatar"/>
                                                    <div>
                                                        <div className="fw-bold">Robert Kim</div>
                                                        <div className="small text-muted">robert.kim@edumanage.com</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>Physical Education</td>
                                            <td>(555) 567-8901</td>
                                            <td><span className="badge bg-success status-badge">Active</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
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
                        </div>
                    </div>
                </div>
            </div>
        
{/* Modal to add new teacher */}
<div class="modal fade" id="addTeacherModal" tabindex="-1" aria-labelledby="addTeacherModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title" id="addTeacherModalLabel">Add New Teacher</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form id="teacherForm" onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input type="text" name='firstname' value={formData.firstname} onChange={handleInputChange} className="form-control" id="teacherFirstName" placeholder="First Name"/>
                                        <label for="teacherFirstName"><i className="fas fa-user me-2"></i>First Name</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input type="text" name='lastname' value={formData.lastname} onChange={handleInputChange} className="form-control" id="teacherLastName" placeholder="Last Name"/>
                                        <label for="teacherLastName"><i className="fas fa-user me-2"></i>Last Name</label>
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input type="email" name='email' value={formData.email} onChange={handleInputChange} className="form-control" id="teacherEmail" placeholder="Email"/>
                                        <label for="teacherEmail"><i className="fas fa-envelope me-2"></i>Email</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input type="tel" name='phone' value={formData.phone} onChange={handleInputChange} className="form-control" id="teacherPhone" placeholder="Phone"/>
                                        <label for="teacherPhone"><i className="fas fa-phone me-2"></i>Phone</label>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label for="teacherSchool" className="form-label"><i className="fas fa-school me-2"></i>Upload Photo</label>
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
                                    />
                                   </div>

                            {/* <div className="mb-3">
                                <div className="form-floating">
                                    <textarea className="form-control" id="teacherBio" style={{ height: "100px" }} placeholder="Bio"></textarea>
                                    <label for="teacherBio"><i className="fas fa-info-circle me-2"></i>Teacher Bio</label>
                                </div>
                            </div> */}

                            <div className="mb-3">
                                <label for="teacherPhoto" className="form-label"><i className="fas fa-image me-2"></i>Upload Photo</label>
                                <input className="form-control" name='photo' onChange={handleFileChange} type="file" id="teacherPhoto"/>
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