import React, {useEffect, useState} from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../ToastMessage';
import axios from 'axios';  
const Dashboard= ()=>
{
const [notification,setNotification]=useState({message:"",type:""});
const Navigate = useNavigate();
const token=localStorage.getItem("AuthToken");
if(!token)
{
    setNotification({message:"Login to access the Dashboard",type:"error"});
    Navigate("/login");
    return;
}
return(
        <>
{notification.message && <ToastMessage message={notification.message} type={notification.type} />}    
            <Sidebar/>
        {/* <!-- Content --> */}
            <div className="page-content">
       <div id="dashboard-page" className="page">
                    <div className="page-header">
                        <h1 className="h2">Dashboard</h1>
                        <div>
                            <button className="btn btn-sm btn-outline-primary"><i className="fas fa-sync-alt"></i> Refresh</button>
                        </div>
                    </div>
                    <div className="row dashboard-summary mb-4">
                        <div className="col-md-3 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="icon"><i className="fas fa-chalkboard-teacher"></i></div>
                                    <div className="count">24</div>
                                    <div className="label">Teachers</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="icon"><i className="fas fa-users"></i></div>
                                    <div className="count">432</div>
                                    <div className="label">Students</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="icon"><i className="fas fa-book"></i></div>
                                    <div className="count">12</div>
                                    <div className="label">Curricula</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="icon"><i className="fas fa-calendar-alt"></i></div>
                                    <div className="count">89</div>
                                    <div className="label">Class Diaries</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Student Attendance</h5>
                                </div>
                                <div className="card-body">
                                    <canvas id="attendanceChart" height="300"></canvas>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Subject Distribution</h5>
                                </div>
                                <div className="card-body">
                                    <canvas id="subjectChart" height="300"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Recent Activities</h5>
                                </div>
                                <div className="card-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-plus-circle text-success me-2"></i>
                                                <span>New teacher added</span>
                                                <small className="text-muted d-block">Sarah Johnson, Mathematics</small>
                                            </div>
                                            <small className="text-muted">2 hours ago</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-edit text-primary me-2"></i>
                                                <span>Curriculum updated</span>
                                                <small className="text-muted d-block">Science, Grade 10</small>
                                            </div>
                                            <small className="text-muted">Yesterday</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-check-circle text-success me-2"></i>
                                                <span>Class diary completed</span>
                                                <small className="text-muted d-block">English, Grade 8</small>
                                            </div>
                                            <small className="text-muted">2 days ago</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-file-alt text-info me-2"></i>
                                                <span>New report generated</span>
                                                <small className="text-muted d-block">Monthly attendance report</small>
                                            </div>
                                            <small className="text-muted">3 days ago</small>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Upcoming Events</h5>
                                </div>
                                <div className="card-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-calendar-day text-danger me-2"></i>
                                                <span>Parent-Teacher Meeting</span>
                                                <small className="text-muted d-block">All grades</small>
                                            </div>
                                            <small className="text-muted">Tomorrow</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-graduation-cap text-primary me-2"></i>
                                                <span>Science Fair</span>
                                                <small className="text-muted d-block">Grades 9-12</small>
                                            </div>
                                            <small className="text-muted">In 5 days</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-book-open text-success me-2"></i>
                                                <span>Curriculum Review</span>
                                                <small className="text-muted d-block">All staff</small>
                                            </div>
                                            <small className="text-muted">Next week</small>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fas fa-trophy text-warning me-2"></i>
                                                <span>Annual Sports Day</span>
                                                <small className="text-muted d-block">Whole school</small>
                                            </div>
                                            <small className="text-muted">In 2 weeks</small>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
           </div>  
        

    </>
    );
};
export default Dashboard;