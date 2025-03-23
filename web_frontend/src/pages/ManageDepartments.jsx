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
    const [showModal, setShowModal] = useState(false);
    const handleButtonClick = (component) => {
        setActiveComponent(component);
        setShowModal(true); // Open the modal
    };
    const handleCloseModal = () => {
        setShowModal(false); // Close the modal
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
        <div class="page-content">
        <div id="Department-page" class="page">
        <div class="page-header">
            <h1 class="h2">Manage Departments</h1>
            <div>
<button class="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addEducationModal" onClick={() => handleButtonClick("EducationType")}>
    <i class="fas fa-plus"></i> Add New Education Type
</button>
<button class="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addLevelModal" onClick={() => handleButtonClick("LevelType")}>
    <i class="fas fa-plus"></i> Add New Level
</button>
<button class="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#addSectionModal"  onClick={() => handleButtonClick("SectionType")}>
    <i class="fas fa-plus"></i> Add New Option
</button>

            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Department List</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
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
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                           
                        </tbody>
                    </table>
                </div>
                <nav>
                    <ul class="pagination justify-content-end">
                        <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item"><a class="page-link" href="#">Next</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
    </div>
    {/* Add Department */}
    {activeComponent === "EducationType" && <EducationType showNotification={showNotification}/>}
    {activeComponent === "LevelType" && <LevelType showNotification={showNotification}/>}
    {activeComponent === "SectionType" && <SectionType showNotification={showNotification}/>}
        </>
    );
};
export default ManageDepartments;