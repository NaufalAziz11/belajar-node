const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    const bearerToken = token.split(' ')[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role; // Extract role from payload
        next();
    });
};

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(403).json({ message: 'Access denied: No role associated with user' });
        }
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRole
};
