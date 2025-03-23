import React,{useState} from 'react';
import axios from 'axios';
const EducationType=({showNotification} )=>
{
const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
});

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value
    });
};
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.code || !formData.name || !formData.description) {
            showNotification("All fields are required!","error");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/department/education-type', { ...formData });
            if (response.data.type === "success") {
                showNotification({message:message.data.message,type:message.data.type})
                setFormData({ code: '', name: '', description: '' }); // Reset form
            } 
            }
        catch (error) {
            showNotification({message:"Failed to add Education Type. Please try again:<br/>"+ error,type:"error"});
        }
    };

    return (
    <>
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
                                        <input type="text" name='code' className="form-control" id="EducationCode" value={formData.code} onChange={handleInputChange} placeholder="Education Type Code" />
                                        <label htmlFor="EducationCode"><i className="fas fa-book me-2"></i>Code</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-3">
                                        <input type="text" name='name' className="form-control" id="EducationTitle" value={formData.name} onChange={handleInputChange} placeholder="Education Title" />
                                        <label htmlFor="EducationTitle"><i className="fas fa-book me-2"></i>Title</label>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="form-floating">
                                    <textarea name='description' className="form-control" id="EducationDescription" style={{ height: "100px" }} value={formData.description} onChange={handleInputChange} placeholder="Description"></textarea>
                                    <label htmlFor="EducationDescription"><i className="fas fa-info-circle me-2"></i>Description</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Education Type</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
export default EducationType;