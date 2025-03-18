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
       
    <button class="btn btn-primary d-md-none position-fixed bottom-3 end-3 z-3" onClick={toggleSidebar} 
    style={{ marginLeft: isToggled ? '150px' : '0' }}>
        <i class={`${isToggled?"fas fa-chevron-left":"fas fa-chevron-right"}`}></i>
    </button>

       <div class={`sidebar ${isToggled ? "show" : ""}`} >
           <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-4 text-white min-vh-100">
               <a href="#" class="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                   <span class="fs-5 d-none d-sm-inline">EduManage</span>
               </a>
               <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                   <li class="nav-item">
                       <Link to="/Dashboard" class="sidebar-link nav-link d-flex align-items-center">
                           <i class="fas fa-tachometer-alt"></i>
                           <span class="ms-2 d-none d-sm-inline">Dashboard</span>
                        </Link>
                   </li>
                   <li class="nav-item" >
                   <Link to="/Teachers" class="sidebar-link nav-link d-flex align-items-center">
                           <i class="fas fa-chalkboard-teacher"></i>
                           <span class="ms-2 d-none d-sm-inline">Teachers</span>
                    </Link>
                   </li>
                   <li class="nav-item">
                   <Link to="/Curricula" class="sidebar-link nav-link d-flex align-items-center">
                           <i class="fas fa-book"></i>
                           <span class="ms-2 d-none d-sm-inline">Curriculum</span>
                    </Link>
                   </li>
                   <li class="nav-item">
                   <Link to="/Diaries" class="sidebar-link nav-link d-flex align-items-center">
                           <i class="fas fa-calendar-alt"></i>
                           <span class="ms-2 d-none d-sm-inline">Class Diary</span>
                    </Link>
                   </li>
                   <li class="nav-item">
                   <Link to="/Reports" class="sidebar-link nav-link d-flex align-items-center">
                           <i class="fas fa-chart-bar"></i>
                           <span class="ms-2 d-none d-sm-inline">Reports</span>
                    </Link>
                   </li>
               </ul>
               <hr/>
               <div class="dropdown pb-4">
                   <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                       <img src="/api/placeholder/50/50" alt="Profile" width="30" height="30" class="rounded-circle"/>
                       <span class="d-none d-sm-inline mx-1">Admin</span>
                   </a>
                   <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
                       <li><a class="dropdown-item" href="#">Settings</a></li>
                       <li><a class="dropdown-item" href="#">Profile</a></li>
                       <li>
                           <hr class="dropdown-divider"/>
                       </li>
                       <li><a class="dropdown-item" href="#">Sign out</a></li>
                   </ul>
               </div>
           </div>
       </div>
       </>
    );
};
export default Sidebar;
