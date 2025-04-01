import React, { useState} from 'react';
import axios from 'axios';

const EducationType = ({ showNotification }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.name || !formData.code || !formData.description) {
            showNotification("All fields are required", "error");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:5000/department/education-type', formData);

            if (response.data.type === "success") {
                showNotification(response.data.message, response.data.type);
                resetForm();
                // Close modal if using Bootstrap
                document.getElementById('addEducationModal')?.classList.remove('show');
                document.querySelector('.modal-backdrop')?.remove();
                document.body.style.overflow = 'auto';
            }
        } catch (error) {
            showNotification(
                `An error occurred while saving: ${error.response?.data?.message || error.message}`,
                "error"
            );
            console.error("Submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal fade" id="addEducationModal" tabIndex="-1" aria-labelledby="addEducationModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title" id="addEducationModalLabel">Add New Education Type</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form id="EducationForm" onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="EducationCode"
                                            placeholder="Education Type Code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="EducationCode"><i className="fas fa-book me-2"></i>Code</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="EducationTitle"
                                            placeholder="Education Title"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <label htmlFor="EducationTitle"><i className="fas fa-book me-2"></i>Title</label>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="form-floating">
                                    <textarea
                                        className="form-control"
                                        id="EducationDescription"
                                        style={{ height: "100px" }}
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                    <label htmlFor="EducationDescription"><i className="fas fa-info-circle me-2"></i>Description</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            form="EducationForm"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Education Type'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationType;