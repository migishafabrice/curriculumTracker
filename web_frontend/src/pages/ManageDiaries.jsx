import Sidebar from "./Sidebar"

const ManageDiaries=()=>
{
    return(
        <>
   
           
           {/* <!--Add side content--> */}
           <Sidebar/>
            {/* <!-- Content --> */}
            <div class="page-content">
        <div id="class-diary-page" class="page">
        <div class="page-header">
            <h1 class="h2">Class Diary Management</h1>
            <div>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addDiaryModal">
                    <i class="fas fa-plus"></i> Add New Diary Entry
                </button>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Class Diary List</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject</th>
                                <th>Grade</th>
                                <th>Teacher</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>D001</td>
                                <td>Mathematics</td>
                                <td>Grade 10</td>
                                <td>John Smith</td>
                                <td>Mar 14, 2025</td>
                                <td><span class="badge bg-success status-badge">Completed</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>D002</td>
                                <td>English</td>
                                <td>Grade 8</td>
                                <td>Emily Johnson</td>
                                <td>Mar 14, 2025</td>
                                <td><span class="badge bg-warning status-badge">Pending</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>D003</td>
                                <td>Science</td>
                                <td>Grade 11</td>
                                <td>Michael Chen</td>
                                <td>Mar 13, 2025</td>
                                <td><span class="badge bg-success status-badge">Completed</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>D004</td>
                                <td>History</td>
                                <td>Grade 9</td>
                                <td>Lisa Rodriguez</td>
                                <td>Mar 13, 2025</td>
                                <td><span class="badge bg-success status-badge">Completed</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-outline-info"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                            <tr>
                                <td>D005</td>
                                <td>Physical Education</td>
                                <td>Grade 10</td>
                                <td>Robert Kim</td>
                                <td>Mar 12, 2025</td>
                                <td><span class="badge bg-success status-badge">Completed</span></td>
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
    {/* Add diary */}

    <div class="modal fade" id="addDiaryModal" tabindex="-1" aria-labelledby="addDiaryModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="addDiaryModalLabel">Add New Class Diary Entry</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="diaryForm">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="diarySubject">
                                            <option selected disabled>Select a subject</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="English">English</option>
                                            <option value="Science">Science</option>
                                            <option value="History">History</option>
                                            <option value="Physical Education">Physical Education</option>
                                        </select>
                                        <label for="diarySubject"><i class="fas fa-book me-2"></i>Subject</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="diaryGrade">
                                            <option selected disabled>Select a grade</option>
                                            <option value="Grade 6">Grade 6</option>
                                            <option value="Grade 7">Grade 7</option>
                                            <option value="Grade 8">Grade 8</option>
                                            <option value="Grade 9">Grade 9</option>
                                            <option value="Grade 10">Grade 10</option>
                                            <option value="Grade 11">Grade 11</option>
                                            <option value="Grade 12">Grade 12</option>
                                        </select>
                                        <label for="diaryGrade"><i class="fas fa-user-graduate me-2"></i>Grade</label>
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <select class="form-select" id="diaryTeacher">
                                            <option selected disabled>Select teacher</option>
                                            <option value="1">John Smith</option>
                                            <option value="2">Emily Johnson</option>
                                            <option value="3">Michael Chen</option>
                                            <option value="4">Lisa Rodriguez</option>
                                            <option value="5">Robert Kim</option>
                                        </select>
                                        <label for="diaryTeacher"><i class="fas fa-chalkboard-teacher me-2"></i>Teacher</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="date" class="form-control" id="diaryDate"/>
                                        <label for="diaryDate"><i class="fas fa-calendar me-2"></i>Date</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="diaryTopics" style={{height: "100px"}} placeholder="Topics Covered"></textarea>
                                    <label for="diaryTopics"><i class="fas fa-list me-2"></i>Topics Covered</label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="diaryActivities" style={{height: "100px"}} placeholder="Activities"></textarea>
                                    <label for="diaryActivities"><i class="fas fa-tasks me-2"></i>Class Activities</label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="diaryHomework" style={{height: "100px"}} placeholder="Homework"></textarea>
                                    <label for="diaryHomework"><i class="fas fa-home me-2"></i>Homework Assigned</label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="diaryNotes" style={{height: "100px"}} placeholder="Additional Notes"></textarea>
                                    <label for="diaryNotes"><i class="fas fa-sticky-note me-2"></i>Additional Notes</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary">Save Diary Entry</button>
                    </div>
                </div>
            </div>
        </div>
       
        </>
    );
};
export default ManageDiaries;