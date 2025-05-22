const express = require('express');
const app = express();
const schoolRoute = require('./routes/schoolRoute');
const teacherRoute=require('./routes/teacherRoute');
const educationRoute=require('./routes/departmentRoute')
const curriculumRoute=require('./routes/curriculumRoute');
const diaryRoute=require('./routes/diaryRoute');
const authRoute=require('./routes/authRoute');
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 5000; // Default port if undefined
// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  };
app.use(cors(corsOptions));
app.use(express.json()); 
// Routes
app.use('/school', schoolRoute);
app.use('/teacher',teacherRoute);
app.use('/department',educationRoute);
app.use('/curriculum',curriculumRoute);
app.use('/diary',diaryRoute);
app.use('/auth',authRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log('Authorization code:', code);
  res.send(`Code: ${code} - Paste this into your script.`);
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
