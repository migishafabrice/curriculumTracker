import React,{useState,useEffect} from "react";
import Sidebar from "./Sidebar";
import EducationType from "./EducationType";
import LevelType from "./LevelType";
import SectionType from "./SectionType";
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from '../ToastMessage';
import { Modal } from "bootstrap";
const ManageDepartments=()=>
{
    const [activeComponent, setActiveComponent] = useState(null);
    const[notification,setNotification]=useState({message:"",type:""});
   // const [showModal, setShowModal] = useState(false);
    const handleButtonClick = (component) => {
        setActiveComponent(component);
        //setShowModal(true); // Open the modal
    };
    const handleCloseModal = () => {
        //setShowModal(false); // Close the modal
        setActiveComponent(null); // Reset the active component
    };

    // Use useEffect to sync Bootstrap modal with React state
    useEffect(() => {
        if (activeComponent) {
            // Dynamically generate the modal ID
            const modalId = `add${activeComponent}Modal`;

            // Show the modal
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = new Modal(modalElement);
                modal.show();

                // Add event listener to handle modal close
                modalElement.addEventListener("hidden.bs.modal", handleCloseModal);
            }
        }
    }, [activeComponent]);
    const showNotification = (message, type) => {
        setNotification({ message, type });

        // Automatically hide the notification after 5 seconds
        setTimeout(() => {
            setNotification({ message: "", type: "" });
        }, 5000);
    };
    return(
        <>
        {notification.message && <ToastMessage message={notification.message} type={notification.type} />}          
           {/* <!--Add side content--> */}
           <Sidebar/>
            {/* <!-- Content --> */}
        <div className="page-content">
        <div id="Department-page" className="page">
        <div className="page-header">
            <h1 className="h2">Manage Departments</h1>
            <div>
<button className="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addModal" onClick={() => handleButtonClick("EducationType")}>
    <i className="fas fa-plus"></i> Add New Education Type
</button>
<button className="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addModal" onClick={() => handleButtonClick("LevelType")}>
    <i className="fas fa-plus"></i> Add New Level
</button>
<button className="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#addModal"  onClick={() => handleButtonClick("SectionType")}>
    <i className="fas fa-plus"></i> Add New Option
</button>

            </div>
        </div>

        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">Department List</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Trades</th>
                                <th>Levels</th>
                                <th>Subjects</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>C001</td>
                                <td>Mathematics</td>
                                <td>Grade 10</td>
                                <td>John Smith</td>
                                <td>Mar 10, 2025</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary"><i className="fas fa-edit"></i></button>
                                    <button className="btn btn-sm btn-outline-info"><i className="fas fa-eye"></i></button>
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
                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
    </div>
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
    {activeComponent === "EducationType" && <EducationType showNotification={showNotification}/>}
    {activeComponent === "LevelType" && <LevelType showNotification={showNotification}/>}
    {activeComponent === "SectionType" && <SectionType showNotification={showNotification}/>}
              </div>
            </div>
         </div>        
   
        </>
    );
};
export default ManageDepartments;