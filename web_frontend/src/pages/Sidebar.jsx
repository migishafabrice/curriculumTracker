import React, { useState }  from "react";
import {Link} from "react-router-dom";
const Sidebar= ()=>
{
    const [isToggled,setIstoggled]=useState(false);
    const toggleSidebar=()=>
        {
           setIstoggled(!isToggled) ;
        }
    return(
        <>
       
    <button className="btn btn-primary d-md-none position-fixed bottom-3 end-3 z-3" onClick={toggleSidebar} 
    style={{ marginLeft: isToggled ? '150px' : '0' }}>
        <i className={`${isToggled?"fas fa-chevron-left":"fas fa-chevron-right"}`}></i>
    </button>

       <div className={`sidebar ${isToggled ? "show" : ""}`} >
           <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-4 text-white min-vh-100">
               <a href="#" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                   <span className="fs-5 d-none d-sm-inline">EduManage</span>
               </a>
               <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                   <li className="nav-item">
                       <Link to="/Dashboard" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-tachometer-alt"></i>
                           <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                        </Link>
                   </li>
                   <li className="nav-item" >
                   <Link to="/Schools" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-school"></i>
                           <span className="ms-2 d-none d-sm-inline">Schools</span>
                    </Link>
                   </li>
                   <li className="nav-item" >
                   <Link to="/Departments" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-chalkboard-teacher"></i>
                           <span className="ms-2 d-none d-sm-inline">Departments</span>
                    </Link>
                   </li>
                   <li className="nav-item" >
                   <Link to="/Teachers" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-chalkboard-teacher"></i>
                           <span className="ms-2 d-none d-sm-inline">Teachers</span>
                    </Link>
                   </li>
                   <li className="nav-item">
                   <Link to="/Curricula" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-book"></i>
                           <span className="ms-2 d-none d-sm-inline">Curriculum</span>
                    </Link>
                   </li>
                   <li className="nav-item">
                   <Link to="/Diaries" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-calendar-alt"></i>
                           <span className="ms-2 d-none d-sm-inline">Class Diary</span>
                    </Link>
                   </li>
                   <li className="nav-item">
                   <Link to="/Reports" className="sidebar-link nav-link d-flex align-items-center">
                           <i className="fas fa-chart-bar"></i>
                           <span className="ms-2 d-none d-sm-inline">Reports</span>
                    </Link>
                   </li>
               </ul>
               <hr/>
               
               <div className="dropdown pb-4">
                   <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                       <img src="/api/placeholder/50/50" alt="Profile" width="30" height="30" className="rounded-circle"/>
                       <span className="d-none d-sm-inline mx-1">Admin</span>
                   </a>
                   <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                       <li>Settings</li>
                       <li>Profile</li>
                       <li>
                           <hr className="dropdown-divider"/>
                       </li>
                       <Link to="/Logout"><li>Sign out</li></Link>
                   </ul>
               </div>
              
           </div>
       </div>
       </>
    );
};
export default Sidebar;
