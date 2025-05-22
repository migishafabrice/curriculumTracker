import React, { useState, useEffect, useCallback } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { fetchEducationTypes } from './AppFunctions';
import axios from 'axios';
import { getCurrentUser } from './AuthUser';
const user = getCurrentUser();
// Generate className options (1-6 with word equivalents)
const classOptions = Array.from({ length: 6 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} (${['One', 'Two', 'Three', 'Four', 'Five', 'Six'][i]})`
}));

const initialFormState = {
  name: '',
  code: '',
  education_type: '',
  classes: [],
  description: ''
};

const LevelType = ({ showNotification }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [educationTypes, setEducationTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEducationTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const types = await fetchEducationTypes();
      setEducationTypes(types.map(({ code, name }) => ({
        value: code,
        label: name
      })));
    } catch (err) {
      showNotification({
        message: 'Failed to fetch education types',
        type: 'error',action:false
      });
      console.error("Failed to fetch education types:", err);
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadEducationTypes();
  }, [loadEducationTypes]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setSelectedOptions([]);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleTypeChange = useCallback((selectedOption) => {
    setFormData(prev => ({
      ...prev,
      education_type: selectedOption ? selectedOption.value : ""
    }));
  }, []);

  const handleClassChange = useCallback((selectedItems) => {
    setSelectedOptions(selectedItems);
    setFormData(prev => ({
      ...prev,
      classes: selectedItems.map(item => item.value)
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.education_type || !formData.description) {
      showNotification("All fields are required", "error",false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/department/level-type', formData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (response.data.type === "success") {
        showNotification(response.data.message, response.data.type,true);
        resetForm();
        // Close modal if using Bootstrap
        document.getElementById('addLevelModal')?.classList.remove('show');
        document.querySelector('.modal-backdrop')?.remove();
        document.body.style.overflow = 'auto';
      }
    } catch (error) {
      showNotification(
        `An error occurred while saving: ${error.response?.data?.message || error.message}`,
        "error",false
      );
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, resetForm, showNotification]);

  return (
    <>
          <div className="modal-body">
            <form id="LevelForm" onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="LevelCode"
                      name="code"
                      placeholder="Level Code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    <label htmlFor="LevelCode"><i className="fas fa-code me-2"></i>Code</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="LevelTitle"
                      name="name"
                      placeholder="Level Title"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    <label htmlFor="LevelTitle"><i className="fas fa-heading me-2"></i>Title</label>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="EducationType"><i className="fas fa-book me-2 mb-3"></i>Education Type</label>
                <Select
                  
                  placeholder={isLoading ? "Loading..." : "Select Education Type"}
                  name="education_type"
                  isClearable={true}
                  isSearchable={true}
                  options={educationTypes}
                  value={educationTypes.find(option => option.value === formData.education_type) || null}
                  onChange={handleTypeChange}
                  isLoading={isLoading}
                  required
                  isDisabled={isLoading}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="ClassSelection"><i className="fas fa-book me-2 mb-3"></i>Promotion ( Levels & Classes)</label>
                <Select
                  isMulti
                  options={classOptions}
                  value={selectedOptions}
                  onChange={handleClassChange}
                  closeMenuOnSelect={false}
                  isDisabled={isLoading}
                />
              </div>
              
              <div className="mb-3">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    id="LevelDescription"
                    name="description"
                    style={{ height: "100px" }}
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <label htmlFor="LevelDescription"><i className="fas fa-info-circle me-2"></i>Description</label>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              data-bs-dismiss="modal" 
              onClick={resetForm}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              form="LevelForm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Save Level Type
            </button>
          </div>
        </>
  );
};

export default React.memo(LevelType);