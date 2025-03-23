import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import axios from 'axios';
import useLoadSchools from './useLoadSchools';
import { Provinces, Districts, Sectors, Cells, Villages } from 'rwanda';

const ManageSchools = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    logo: null,
  });

  const [notification, setNotification] = useState({ message: null, type: null });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);
  useEffect(() => {
    setProvinces(Provinces());
  }, []);

  const { schools, notice, loadSchools } = useLoadSchools();
  useEffect(() => {
    if (notice) {
      setNotification(notice);
    }
  }, [notice]);
  // Load schools when the component mounts
  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { isValid, errors } = inputValidate(formData);
      if (!isValid) {
        setNotification({ message: errors.join(', '), type: 'error' });
        return;
      }

      const data = new FormData();
      data.append('address', `${formData.province} - ${formData.district} - ${formData.sector} - ${formData.cell} - ${formData.village}`);
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'province' && key !== 'district' && key !== 'sector' && key !== 'cell' && key !== 'village') {
          data.append(key, value);
        }
      });

      const response = await axios.post('http://localhost:5000/school/addSchool', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.type === 'success') {
        setNotification({ message: response.data.message, type: 'success' });
        loadSchools();
        resetForm();
      } else {
        setNotification({ message: response.data.error, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error: ${error.message}`, type: 'error' });
    }
  };

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
      logo: null,
    });
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
  };

  return (
    <>
      {notification.message && <ToastMessage message={notification.message} type={notification.type} />}
      <Sidebar />
      <div className="page-content">
        <div id="Schools-page" className="page">
          <div className="page-header">
            <h1 className="h2">Schools Management</h1>
            <div>
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSchoolModal">
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
                        {/* <th>ID</th> */}
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
                          {/* <td>{school.id}</td> */}
                          <td>
                            <div className="d-flex align-items-center">
                              <img src={`http://127.0.0.1:5000${school.logo}`} alt="Avatar" className="avatar" />
                              <div>
                                <div className="fw-bold">{school.name}</div>
                                {/* <div className="small text-muted">school.email}</div> */}
                              </div>
                            </div>
                          </td>
                          <td>{school.telephone}</td>
                          <td>{school.email}</td>
                          <td>{school.address}</td>
                          <td>
                            <span className={school.active?("badge bg-success status-badge"):("badge bg-danger status-badge")}>Active</span>
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

      {/* Modal to add new School */}
      <div className="modal fade" id="addSchoolModal" tabIndex="-1" aria-labelledby="addSchoolModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="addSchoolModalLabel">Add New School</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="SchoolForm" onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" id="SchoolName" placeholder="Name" />
                      <label htmlFor="SchoolName"><i className="fas fa-user me-2"></i>Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" id="SchoolPhone" placeholder="Telephone" />
                      <label htmlFor="SchoolPhone"><i className="fas fa-phone me-2"></i>Phone</label>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="form-floating mb-3">
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" id="SchoolEmail" placeholder="Email" />
                      <label htmlFor="SchoolEmail"><i className="fas fa-envelope me-2"></i>Email</label>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <select className="form-select" id="schoolProvince" name="province" value={formData.province} onChange={handleProvinceChange}>
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
                      <select className="form-select" id="schoolDistrict" name="district" value={formData.district} onChange={handleDistrictChange}>
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
                      <select className="form-select" id="schoolSector" name="sector" value={formData.sector} onChange={handleSectorChange}>
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
                      <select className="form-select" id="schoolCell" name="cell" value={formData.cell} onChange={handleCellChange}>
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
                      <select className="form-select" id="schoolVillage" name="village" value={formData.village} onChange={handleInputChange}>
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
                <div className="mb-3">
                  <label htmlFor="SchoolPhoto" className="form-label"><i className="fas fa-image me-2"></i>Upload Logo</label>
                  <input className="form-control" name="logo" onChange={handleFileChange} type="file" id="SchoolPhoto" />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save School</button>
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