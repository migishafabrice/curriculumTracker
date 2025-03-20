const express = require('express');
const app = express();
const schoolRoute = require('./routes/schoolRoute');
const cors = require('cors');
const port = process.env.PORT || 5000; // Default port if undefined
app.use(cors());
// Middleware
app.use(express.json()); // To parse JSON requests

// Routes
app.use('/school', schoolRoute);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
