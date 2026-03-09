const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');

    if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = user;
    next();
};

module.exports = { protect };
