import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { fetchEducationTypes, fetchLevelTypes } from './AppFunctions';
import { getCurrentUser } from './AuthUser';
import { act } from 'react';
const user=getCurrentUser();
const SectionType = ({ showNotification }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        education_type: '',
        level_type: '',
        description: ''
    });
    
    const [educationTypes, setEducationTypes] = useState([]);
    const [levelTypesOptions, setLevelTypesOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                type: 'error',
                action: false
            });
            console.error("Failed to fetch education types:", err);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    const loadLevelTypes = useCallback(async (educationTypeCode) => {
        if (!educationTypeCode) {
            setLevelTypesOptions([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const levels = await fetchLevelTypes(educationTypeCode);
            setLevelTypesOptions(levels.map(({ code, name }) => ({
                value: code,
                label: name
            })));
        } catch (err) {
            showNotification({
                message: 'Failed to fetch level types',
                type: 'error',act
            });
            console.error("Failed to fetch level types:", err);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadEducationTypes();
    }, [loadEducationTypes]);

    useEffect(() => {
        if (formData.education_type) {
            loadLevelTypes(formData.education_type);
        } else {
            setLevelTypesOptions([]);
        }
    }, [formData.education_type, loadLevelTypes]);

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            code: '',
            education_type: '',
            level_type: '',
            description: ''
        });
        setLevelTypesOptions([]);
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEducationTypeChange = useCallback((selectedOption) => {
        const educationTypeCode = selectedOption ? selectedOption.value : "";
        setFormData(prev => ({
            ...prev,
            education_type: educationTypeCode,
            level_type: "" // Reset level type when education type changes
        }));
    }, []);

    const handleLevelTypeChange = useCallback((selectedOption) => {
        setFormData(prev => ({
            ...prev,
            level_type: selectedOption ? selectedOption.value : ""
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!formData.code || !formData.name || !formData.education_type || !formData.level_type) {
            showNotification("All fields are required", "error", false);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/department/section-type',
                 formData,
                    {
                        headers: {
                             
                            'Authorization': `Bearer ${user.token}`
                        }
                    }
                    
                );

            if (response.data.type === "success") {
                showNotification(response.data.message, response.data.type, true);
                resetForm();
                // Close modal if using Bootstrap
                document.getElementById('addSectionTypeModal')?.classList.remove('show');
                document.querySelector('.modal-backdrop')?.remove();
                document.body.style.overflow = 'auto';
            }
        } catch (error) {
            showNotification(
                `An error occurred while saving: ${error.response?.data?.message || error.message}`,
                "error", false
            );
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, resetForm, showNotification]);

    return (
       <>
                    <div className="modal-body">
                        <form id="OptionForm" onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="OptionCode"
                                            name="code"
                                            placeholder="Option Code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isSubmitting}
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
                                            name="name"
                                            placeholder="Option Title"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isSubmitting}
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
                                    options={educationTypes}
                                    value={educationTypes.find(option => option.value === formData.education_type) || null}
                                    onChange={handleEducationTypeChange}
                                    isLoading={isLoading}
                                    isClearable
                                    required
                                    isDisabled={isSubmitting}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="LevelType"><i className="fas fa-layer-group me-2"></i>Level Type</label>
                                <Select
                                    
                                    placeholder={formData.education_type ? (isLoading ? "Loading..." : "Select Level Type") : "Select Education Type first"}
                                    options={levelTypesOptions}
                                    value={levelTypesOptions.find(option => option.value === formData.level_type) || null}
                                    onChange={handleLevelTypeChange}
                                    isLoading={isLoading}
                                    isDisabled={!formData.education_type || isSubmitting}
                                    isClearable
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <div className="form-floating">
                                    <textarea
                                        className="form-control"
                                        id="OptionDescription"
                                        name="description"
                                        style={{ height: "100px" }}
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
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
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            form="OptionForm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : null}
                            Save Option Type
                        </button>
                    </div>
                </>
            
    );
};

export default React.memo(SectionType);