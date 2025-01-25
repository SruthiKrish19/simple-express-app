const jwt = require('jsonwebtoken');
require('dotenv').config();

const authJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Malformed token' });

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        
        req.user = decoded.username;
        next();
    });
}

module.exports = authJWT;
