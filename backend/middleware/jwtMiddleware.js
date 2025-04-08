// JWT Middleware
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { JWT_SECRET } = process.env.JWT_SECRET;
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
    req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };
module.exports = authenticateJWT;
