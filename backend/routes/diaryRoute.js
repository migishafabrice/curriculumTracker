const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const{addDiaryEntry,getDiaries}=require('../controllers/diaryController');
router.post('/add-diary-entry',jwtMiddleware,addDiaryEntry);
router.post('/get-diary-entries',jwtMiddleware,getDiaries);
module.exports = router;