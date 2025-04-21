const jwt = require('jsonwebtoken');
require('dotenv').config();

// Fixed JWT_SECRET assignment
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Improved header check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
        if (err) {
            // Basic error differentiation
            return res.status(err.name === 'TokenExpiredError' ? 401 : 403).send();
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;