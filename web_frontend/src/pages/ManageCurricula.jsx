import React from "react";
import Sidebar from "./Sidebar";
const ManageCurricula=()=>
{
    return(
        <>
                  
           {/* <!--Add side content--> */}
           <Sidebar/>
            {/* <!-- Content --> */}
            <div class="page-content">
        <div id="curriculum-page" class="page">
        <div class="page-header">
            <h1 class="h2">Curriculum Management</h1>
            <div>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCurriculumModal">
                    <i class="fas fa-plus"></i> Add New Curriculum
                </button>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Curriculum List</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject</th>
                                <th>Grade</th>
                                <th>Created By</th>
                                <th>Last Update</th>
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
                            <tr>
                                <td>C002</td>
                                <td>English Language</td>
                                <td>Grade 8</td>
                                <td>Emily Johnson</td>
                                <td>Mar 8, 2025</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>C003</td>
                                <td>Biology</td>
                                <td>Grade 11</td>
                                <td>Michael Chen</td>
                                <td>Mar 5, 2025</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>C004</td>
                                <td>History</td>
                                <td>Grade 9</td>
                                <td>Lisa Rodriguez</td>
                                <td>Feb 28, 2025</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>C005</td>
                                <td>Physics</td>
                                <td>Grade 12</td>
                                <td>Robert Kim</td>
                                <td>Feb 25, 2025</td>
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
    {/* Add curriculum */}
    <div class="modal fade" id="addCurriculumModal" tabindex="-1" aria-labelledby="addCurriculumModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="addCurriculumModalLabel">Add New Curriculum</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="curriculumForm">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="curriculumTitle" placeholder="Curriculum Title"/>
                                        <label for="curriculumTitle"><i class="fas fa-book me-2"></i>Curriculum Title</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="curriculumSubject">
                                            <option selected disabled>Select a subject</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="English">English Language</option>
                                            <option value="Science">Science</option>
                                            <option value="Biology">Biology</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Physics">Physics</option>
                                            <option value="History">History</option>
                                            <option value="Geography">Geography</option>
                                            <option value="Social Studies">Social Studies</option>
                                            <option value="Physical Education">Physical Education</option>
                                            <option value="Arts">Arts</option>
                                            <option value="Music">Music</option>
                                        </select>
                                        <label for="curriculumSubject"><i class="fas fa-graduation-cap me-2"></i>Subject</label>
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="curriculumGrade">
                                            <option selected disabled>Select a grade</option>
                                            <option value="Grade 6">Grade 6</option>
                                            <option value="Grade 7">Grade 7</option>
                                            <option value="Grade 8">Grade 8</option>
                                            <option value="Grade 9">Grade 9</option>
                                            <option value="Grade 10">Grade 10</option>
                                            <option value="Grade 11">Grade 11</option>
                                            <option value="Grade 12">Grade 12</option>
                                        </select>
                                        <label for="curriculumGrade"><i class="fas fa-user-graduate me-2"></i>Grade</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="curriculumTeacher">
                                            <option selected disabled>Select primary teacher</option>
                                            <option value="1">John Smith</option>
                                            <option value="2">Emily Johnson</option>
                                            <option value="3">Michael Chen</option>
                                            <option value="4">Lisa Rodriguez</option>
                                            <option value="5">Robert Kim</option>
                                        </select>
                                        <label for="curriculumTeacher"><i class="fas fa-chalkboard-teacher me-2"></i>Primary Teacher</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="curriculumDescription" style={{height:"100px"}} placeholder="Description"></textarea>
                                    <label for="curriculumDescription"><i class="fas fa-info-circle me-2"></i>Curriculum Description</label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="curriculumObjectives" style={{height: "100px"}} placeholder="Learning Objectives"></textarea>
                                    <label for="curriculumObjectives"><i class="fas fa-bullseye me-2"></i>Learning Objectives</label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="curriculumDocument" class="form-label"><i class="fas fa-file-upload me-2"></i>Upload Curriculum Document</label>
                                <input class="form-control" type="file" id="curriculumDocument"/>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary">Save Curriculum</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};
export default ManageCurricula;