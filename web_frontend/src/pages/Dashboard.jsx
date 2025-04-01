import React from 'react'
import Sidebar from './Sidebar'
const Dashboard= ()=>
{
    return(
        <>
     
            <Sidebar/>
        {/* <!-- Content --> */}
            <div class="page-content">
       <div id="dashboard-page" class="page">
                    <div class="page-header">
                        <h1 class="h2">Dashboard</h1>
                        <div>
                            <button class="btn btn-sm btn-outline-primary"><i class="fas fa-sync-alt"></i> Refresh</button>
                        </div>
                    </div>
                    <div class="row dashboard-summary mb-4">
                        <div class="col-md-3 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="icon"><i class="fas fa-chalkboard-teacher"></i></div>
                                    <div class="count">24</div>
                                    <div class="label">Teachers</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="icon"><i class="fas fa-users"></i></div>
                                    <div class="count">432</div>
                                    <div class="label">Students</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="icon"><i class="fas fa-book"></i></div>
                                    <div class="count">12</div>
                                    <div class="label">Curricula</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="icon"><i class="fas fa-calendar-alt"></i></div>
                                    <div class="count">89</div>
                                    <div class="label">Class Diaries</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-8 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Student Attendance</h5>
                                </div>
                                <div class="card-body">
                                    <canvas id="attendanceChart" height="300"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Subject Distribution</h5>
                                </div>
                                <div class="card-body">
                                    <canvas id="subjectChart" height="300"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Recent Activities</h5>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-plus-circle text-success me-2"></i>
                                                <span>New teacher added</span>
                                                <small class="text-muted d-block">Sarah Johnson, Mathematics</small>
                                            </div>
                                            <small class="text-muted">2 hours ago</small>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-edit text-primary me-2"></i>
                                                <span>Curriculum updated</span>
                                                <small class="text-muted d-block">Science, Grade 10</small>
                                            </div>
                                            <small class="text-muted">Yesterday</small>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-check-circle text-success me-2"></i>
                                                <span>Class diary completed</span>
                                                <small class="text-muted d-block">English, Grade 8</small>
                                            </div>
                                            <small class="text-muted">2 days ago</small>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-file-alt text-info me-2"></i>
                                                <span>New report generated</span>
                                                <small class="text-muted d-block">Monthly attendance report</small>
                                            </div>
                                            <small class="text-muted">3 days ago</small>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Upcoming Events</h5>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-calendar-day text-danger me-2"></i>
                                                <span>Parent-Teacher Meeting</span>
                                                <small class="text-muted d-block">All grades</small>
                                            </div>
                                            <small class="text-muted">Tomorrow</small>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-graduation-cap text-primary me-2"></i>
                                                <span>Science Fair</span>
                                                <small class="text-muted d-block">Grades 9-12</small>
                                            </div>
                                            <small class="text-muted">In 5 days</small>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-book-open text-success me-2"></i>
                                                <span>Curriculum Review</span>
                                                <small class="text-muted d-block">All staff</small>
                                            </div>
                                            <small class="text-muted">Next week</small>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-trophy text-warning me-2"></i>
                                                <span>Annual Sports Day</span>
                                                <small class="text-muted d-block">Whole school</small>
                                            </div>
                                            <small class="text-muted">In 2 weeks</small>
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