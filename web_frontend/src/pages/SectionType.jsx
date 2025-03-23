import react,{useState} from 'react';
const OptionType=()=>
{
   const [name,setName]=useState("");
   const [description,setDescription]=useState("");
   const [code,setCode]=useState("");
    return(
        <div class="modal fade" id="addOptionModal" tabindex="-1" aria-labelledby="addOptionModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
        <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="addOptionModalLabel">Add New Option</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="OptionForm">
                        <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="OptionCode" placeholder="Option Code"/>
                                        <label for="OptionCode"><i class="fas fa-book me-2"></i>Code</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="OptionTitle" placeholder="Option Title"/>
                                        <label for="OptionTitle"><i class="fas fa-book me-2"></i>Title</label>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-floating">
                                    <select class="form-select" id="EducationType" placeholder="Education Type"/>
                                    <label for="OptionDescription"><i class="fas fa-info-circle me-2"></i>Education Type</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-floating">
                                    <select class="form-select" id="EducationType" placeholder="Level Type"/>
                                    <label for="LevelType"><i class="fas fa-info-circle me-2"></i>Level Type</label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-floating">
                                    <textarea class="form-control" id="OptionDescription" style={{height:"100px"}} placeholder="Description"></textarea>
                                    <label for="OptionDescription"><i class="fas fa-info-circle me-2"></i>Description</label>
                                </div>
                            </div>
                            </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary">Save Option Type</button>
                    </div>
                </div>
                </div>
                </div>
    );
}
export default OptionType;