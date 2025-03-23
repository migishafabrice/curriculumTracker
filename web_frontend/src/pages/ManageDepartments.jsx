import React from "react";
import Sidebar from "./Sidebar";
const ManageDepartments=()=>
{
    return(
        <>
                  
           {/* <!--Add side content--> */}
           <Sidebar/>
            {/* <!-- Content --> */}
        <div class="page-content">
        <div id="Department-page" class="page">
        <div class="page-header">
            <h1 class="h2">Manage Departments</h1>
            <div>
            <button class="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addDepartmentModal">
    <i class="fas fa-plus"></i> Add New Type
</button>
<button class="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addDepartmentModal">
    <i class="fas fa-plus"></i> Add New Category
</button>
<button class="btn btn-primary me-3 mb-2" data-bs-toggle="modal" data-bs-target="#addDepartmentModal">
    <i class="fas fa-plus"></i> Add New Section - Trade
</button>
<button class="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#addDepartmentModal">
    <i class="fas fa-plus"></i> Add New Level
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
    
        </>
    );
};
export default ManageDepartments;