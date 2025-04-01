import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const SectionType = ({ showNotification }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        education_type: '',
        level_type: '',
        description: ''
    });
    
    const [educationTypeOptions, setEducationTypeOptions] = useState([]);
    const [levelTypeOptions, setLevelTypeOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch education types on component mount
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
                }
            } catch (error) {
                showNotification(
                    `Failed to fetch education types: ${error.response?.data?.message || error.message}`,
                    "error"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchEducationTypes();
    }, [showNotification]);

    // Fetch level types when education type changes
    useEffect(() => {
        const fetchLevelTypes = async () => {
            if (!formData.education_type) return;
            
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:5000/department/level-types?education_type_code=${formData.education_type}`
                );
                
                if (response.data.type === "success") {
                    setLevelTypeOptions(
                        response.data.levelTypes.map(level => ({
                            value: level.code,
                            label: level.name
                        }))
                    );
                }
            } catch (error) {
                showNotification(
                    `Failed to fetch level types: ${error.response?.data?.message || error.message}`,
                    "error"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchLevelTypes();
    }, [formData.education_type, showNotification]);

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            education_type: '',
            level_type: '',
            description: ''
        });
    };

    const handleEducationTypeChange = (selectedOption) => {
        setFormData({
            ...formData,
            education_type: selectedOption ? selectedOption.value : "",
            level_type: "" // Reset level type when education type changes
        });
    };

    const handleLevelTypeChange = (selectedOption) => {
        setFormData({
            ...formData,
            level_type: selectedOption ? selectedOption.value : ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.code || !formData.name || !formData.education_type || !formData.level_type) {
            showNotification("All fields are required", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/department/section-type', formData);

            if (response.data.type === "success") {
                showNotification(response.data.message, response.data.type);
                resetForm();
                // // Close modal
                // document.getElementById('addSectionTypeModal')?.classList.remove('show');
                // document.querySelector('.modal-backdrop')?.remove();
                // document.body.style.overflow = 'auto';
            }
        } catch (error) {
            showNotification(
                `An error occurred while saving: ${error.response?.data?.message || error.message}`,
                "error"
            );
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal fade" id="addSectionTypeModal" tabIndex="-1" aria-labelledby="addSectionTypeModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title" id="addOptionModalLabel">Add New Option</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form id="OptionForm" onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="OptionCode"
                                            placeholder="Option Code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="OptionCode"><i className="fas fa-book me-2"></i>Code</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="OptionTitle"
                                            placeholder="Option Title"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="OptionTitle"><i className="fas fa-book me-2"></i>Title</label>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="EducationType"><i className="fas fa-graduation-cap me-2"></i>Education Type</label>
                                <Select
                                    classNamePrefix="select"
                                    placeholder={isLoading ? "Loading..." : "Select Education Type"}
                                    options={educationTypeOptions}
                                    value={educationTypeOptions.find(option => option.value === formData.education_type) || null}
                                    onChange={handleEducationTypeChange}
                                    isLoading={isLoading}
                                    isClearable
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="LevelType"><i className="fas fa-layer-group me-2"></i>Level Type</label>
                                <Select
                                    classNamePrefix="select"
                                    placeholder={formData.education_type ? (isLoading ? "Loading..." : "Select Level Type") : "Select Education Type first"}
                                    options={levelTypeOptions}
                                    value={levelTypeOptions.find(option => option.value === formData.level_type) || null}
                                    onChange={handleLevelTypeChange}
                                    isLoading={isLoading}
                                    isDisabled={!formData.education_type}
                                    isClearable
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <div className="form-floating">
                                    <textarea
                                        className="form-control"
                                        id="OptionDescription"
                                        style={{ height: "100px" }}
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <label htmlFor="OptionDescription"><i className="fas fa-info-circle me-2"></i>Description</label>
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
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            form="OptionForm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Option Type'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionType;