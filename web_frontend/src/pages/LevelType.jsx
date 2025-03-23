import react,{useState} from 'react';
const LevelType=()=>
{
   const [name,setName]=useState("");
   const [description,setDescription]=useState("");
   const [code,setCode]=useState("");
    return(
        <div class="modal fade" id="addLevelModal" tabindex="-1" aria-labelledby="addLevelModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
        <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="addLevelModalLabel">Add New Level Type</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="LevelForm">
                        <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="LevelCode" placeholder="Level Code"/>
                                        <label for="LevelCode"><i class="fas fa-book me-2"></i>Code</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="LevelTitle" placeholder="Level Title"/>
                                        <label for="LevelTitle"><i class="fas fa-book me-2"></i>Title</label>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-floating">
                                    <select class="form-select" id="EducationType" placeholder="Description"/>
                                    <label for="LevelDescription"><i class="fas fa-info-circle me-2"></i>Education Type</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="LevelDescription" style={{height:"100px"}} placeholder="Description"></textarea>
                                    <label for="LevelDescription"><i class="fas fa-info-circle me-2"></i>Description</label>
                                </div>
                            </div>
                            </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary">Save Level Type</button>
                    </div>
                </div>
                </div>
                </div>
    );
}
export default LevelType;