const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    // Check for cookie or Authorization header (for flexibility)
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token Verified Successfully:', { userId: decoded.id, role: decoded.role });
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token Verification Failed:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.optionalProtect = (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            console.error('Optional token verification failed');
        }
    }
    next();
};

exports.admin = (req, res, next) => {
    console.log('Admin Check - User:', req.user ? { id: req.user.id, role: req.user.role } : 'None');
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.warn('Admin Check FAILED for user:', req.user);
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};
