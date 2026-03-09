const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { sendOTP } = require('../utils/otp');

// @desc  Request OTP for login/register
// @route POST /api/auth/request-otp
const requestOTP = async (req, res) => {
    const { phone, purpose = 'login' } = req.body;

    // Invalidate existing OTPs for this phone+purpose
    await OTP.updateMany({ phone, purpose, used: false }, { used: true });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ phone, code, purpose });

    await sendOTP(phone, code);

    res.json({ success: true, message: 'OTP sent successfully' });
};

// @desc  Admin Email/Password Login (Bypass OTP for Dev/Admin)
// @route POST /api/auth/admin-login
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || user.role !== 'admin' || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Invalid credentials or unauthorized' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens({ id: user._id, role: user.role });
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
        success: true,
        accessToken,
        refreshToken,
        user,
    });
};

// @desc  Verify OTP and login/register
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    const { phone, code, purpose = 'login' } = req.body;

    const otp = await OTP.findOne({ phone, code, purpose, used: false });

    if (!otp) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    if (otp.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    otp.used = true;
    await otp.save();

    // Find or create user
    let user = await User.findOne({ phone });
    const isNewUser = !user;

    if (isNewUser) {
        user = await User.create({ phone, isVerified: true });
    } else {
        user.isVerified = true;
        await user.save();
    }

    const { accessToken, refreshToken } = generateTokens({ id: user._id, role: user.role });
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
        success: true,
        isNewUser,
        accessToken,
        refreshToken,
        user,
    });
};

// @desc  Refresh access token
// @route POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens({ id: user._id, role: user.role });
    user.refreshToken = newRefresh;
    await user.save();

    res.json({ success: true, accessToken, refreshToken: newRefresh });
};

// @desc  Logout — clear refresh token
// @route POST /api/auth/logout
const logout = async (req, res) => {
    if (req.user) {
        await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }
    res.json({ success: true, message: 'Logged out successfully' });
};

// @desc  Get authenticated user
// @route GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
};

module.exports = { requestOTP, verifyOTP, adminLogin, refreshToken, logout, getMe };
