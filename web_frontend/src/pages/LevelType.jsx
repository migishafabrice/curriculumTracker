import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Select from 'react-select';

const LevelType = ({ showNotification }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        education_type: '',
        classes: [],
        description: ''
    });
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [educationTypeOptions, setEducationTypeOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Generate class options (1-6 with word equivalents)
    const classOptions = Array.from({ length: 6 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1} (${['One', 'Two', 'Three', 'Four', 'Five', 'Six'][i]})`
    }));

    useEffect(() => {
        const fetchEducationTypes = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/department/education-types');
                if (response.data.type === "success") {
                    setEducationTypeOptions(
                        response.data.educationTypes.map(type => ({ 
                            value: type.code, 
                            label: type.name 
                        }))
                    );
                } else {
                    showNotification({
                        message: "Failed to fetch education types",
                        type: "error"
                    });
                }
            } catch (error) {
                showNotification({
                    message: `An error occurred while fetching education types: ${error.response?.data?.message || error.message}`,
                    type: "error"
                });
                console.error("Error fetching education types:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEducationTypes();
    }, [showNotification]);
 
    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            education_type: '',
            classes: [],
            description: ''
        });
        setSelectedOptions([]);
    };
        
    const handleTypeChange = (selectedOption) => {
        setFormData({
            ...formData,
            education_type: selectedOption ? selectedOption.value : ""
        });
    };

    const handleClassChange = (selectedItems) => {
        setSelectedOptions(selectedItems);
        setFormData({
            ...formData,
            classes: selectedItems.map(item => item.value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.name || !formData.code || !formData.education_type || !formData.description) {
            showNotification("All fields are required", "error");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/department/level-type', formData);

            if (response.data.type === "success") {
                showNotification(response.data.message, response.data.type);
                resetForm();
                // Close modal if using Bootstrap
                document.getElementById('addLevelModal')?.classList.remove('show');
                document.querySelector('.modal-backdrop')?.remove();
                document.body.style.overflow = 'auto';
            }
        } catch (error) {
            showNotification(
                `An error occurred while saving: ${error.response?.data?.message || error.message}`,
                "error"
            );
            console.error("Submission error:", error);
        }
    };

    return (
        <div className="modal fade" id="addLevelModal" tabIndex="-1" aria-labelledby="addLevelModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title" id="addLevelModalLabel">Add New Level Type</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form id="LevelForm" onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="LevelCode"
                                            placeholder="Level Code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
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
                                            placeholder="Level Title"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="LevelTitle"><i className="fas fa-heading me-2"></i>Title</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="EducationType"><i className="fas fa-book me-2 mb-3"></i>Education Type</label>
                                <Select
                                    classNamePrefix="select"
                                    placeholder={isLoading ? "Loading..." : "Select Education Type"}
                                    name="education_type"
                                    isClearable={true}
                                    isSearchable={true}
                                    options={educationTypeOptions}
                                    value={educationTypeOptions.find(option => option.value === formData.education_type) || null}
                                    onChange={handleTypeChange}
                                    isLoading={isLoading}
                                    required
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="ClassSelection"><i className="fas fa-book me-2 mb-3"></i>Promotion (Level & Classes)</label>
                                <Select
                                    isMulti
                                    options={classOptions}
                                    value={selectedOptions}
                                    onChange={handleClassChange}
                                    closeMenuOnSelect={false}
                                />
                            </div>
                            
                            <div className="mb-3">
                                <div className="form-floating">
                                    <textarea
                                        className="form-control"
                                        id="LevelDescription"
                                        style={{ height: "100px" }}
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                    <label htmlFor="LevelDescription"><i className="fas fa-info-circle me-2"></i>Description</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" form="LevelForm">
                            Save Level Type
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelType;