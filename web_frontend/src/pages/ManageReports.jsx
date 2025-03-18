import React from 'react';
import Sidebar from './Sidebar';
const ManageReports=()=>
{
    return(
        <>           
           {/* <!--Add side content--> */}
           <Sidebar/>
            {/* <!-- Content --> */}
            <div class="page-content">
        <div id="reports-page" class="page">
        <div class="page-header">
            <h1 class="h2">Reports</h1>
            <div>
                <button class="btn btn-outline-primary me-2">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn btn-outline-secondary">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Attendance By Class</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="attendanceByClassChart" height="300"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Performance By Subject</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="performanceChart" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Teacher Workload Distribution</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="workloadChart" height="300"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Curriculum Completion</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="completionChart" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
   </div>
</>
    );
};
export default ManageReports;