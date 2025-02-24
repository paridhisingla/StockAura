const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config.js');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication required' });
    }
};

module.exports = auth;