import React, { useState } from "react";
import { Link } from "react-router-dom";
import noImage from '../assets/img/no-image.png'; 
import { getCurrentUser } from "./AuthUser"; // Adjust the import path as necessary
const Sidebar = () => {
    const [isToggled, setIsToggled] = useState(false);
    const toggleSidebar = () => setIsToggled(!isToggled);
    const user = getCurrentUser();

    return (
        <>
            <button 
                className="btn btn-primary d-md-none position-fixed bottom-3 end-3 z-3" 
                onClick={toggleSidebar}
                style={{ marginLeft: isToggled ? '150px' : '0' }}
                aria-label="Toggle sidebar"
            >
                <i className={`fas ${isToggled ? "fa-chevron-left" : "fa-chevron-right"}`}></i>
            </button>

            <div className={`sidebar ${isToggled ? "show" : ""}`}>
                <div className="d-flex flex-column justify-content-between px-3 pt-3 text-white min-vh-100">
                    <div>
                        <Link to="/" className="d-flex align-items-center pb-2 mb-md-0 me-md-auto text-white text-decoration-none">
                            <span className="fs-5 d-none d-sm-inline">EduManage</span>
                        </Link>

                        <ul className="nav nav-pills flex-column mb-2">
                            {[
                                { to: "/Dashboard", icon: "fa-tachometer-alt", text: "Dashboard" },
                                { to: "/Schools", icon: "fa-school", text: "Schools" },
                                { to: "/Departments", icon: "fa-chalkboard-teacher", text: "Departments" },
                                { to: "/Teachers", icon: "fa-users", text: "Teachers" },
                                { to: "/Courses", icon: "fa-users", text: "Courses" },
                                { to: "/Curricula", icon: "fa-book", text: "Curriculum" },
                                { to: "/Diaries", icon: "fa-calendar-alt", text: "Class Diary" },
                                { to: "/Reports", icon: "fa-chart-bar", text: "Reports" }
                            ].map((item, index) => (
                                <li key={index} className="nav-item">
                                    <Link to={item.to} className="sidebar-link nav-link d-flex align-items-center py-2">
                                        <i className={`fas ${item.icon} me-2`}></i>
                                        <span className="d-none d-sm-inline">{item.text}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Profile Section */}
                    <div className="user-profile pb-2">
                        <div className="d-flex align-items-center text-white mb-2">
                            <img 
                                src={noImage} 
                                alt="User profile" 
                                width="36" 
                                height="36" 
                                className="rounded-circle me-2 border border-light"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = noImage;
                                }}
                            />
                            <div className="d-flex flex-column">
                                <span className="fw-bold small">{user.firstname} {user.lastname}</span>
                                <hr width="100%"/>
                                <span className="fs-8 fw-bold text-warning">{user.role}</span>
                            </div>
                        </div>
                        
                        <div className="d-flex flex-column gap-1">
                            <Link to="/profile" className="btn btn-outline-light btn-sm py-1">
                                <i className="fas fa-user me-1"></i>
                                <span>Profile</span>
                            </Link>
                            <Link to="/logout" className="btn btn-danger btn-sm py-1">
                                <i className="fas fa-sign-out-alt me-1"></i>
                                <span>Sign Out</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;