const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
    try {
        const { username, email, password, referralCode } = req.body;

        const userExists = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (userExists) {
            return res.status(400).json({ message: 'User with this username or email already exists' });
        }

        // Generate a unique referral code for the new user
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newUser = new User({
            username,
            email,
            password,
            role: 'student',
            referralCode: newReferralCode,
            points: 0 // Start with 0, get 5 on first login
        });

        // Handle referral
        if (referralCode) {
            const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
            if (referrer) {
                newUser.referredBy = referrer._id;
                newUser.points += 20; // Referee bonus
                referrer.points += 50; // Referrer bonus
                await referrer.save();
            }
        }

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', referralCode: newReferralCode });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Gamification logic
        let pointsAwarded = 0;
        let streakStatus = '';
        const now = new Date();
        const lastLogin = user.lastLoginDate;

        if (!lastLogin) {
            // First time login bonus
            user.lastLoginDate = now;
            user.loginStreak = 1;
            user.points += 5; // Award daily points on first login too
            pointsAwarded = 5;
            await user.save();
        } else {
            const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
            const todayDate = new Date(now).setHours(0, 0, 0, 0);
            const diffInDays = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));

            if (diffInDays === 1) {
                // Consecutive login
                user.loginStreak += 1;
                user.points += 5; // Daily login points
                pointsAwarded = 5;

                // Streak milestone every 7 days
                if (user.loginStreak % 7 === 0) {
                    user.points += 20;
                    pointsAwarded += 20;
                    streakStatus = `7-day streak! +20 bonus points!`;
                }
                user.lastLoginDate = now;
                await user.save();
            } else if (diffInDays > 1) {
                // Streak broken
                user.loginStreak = 1;
                user.points += 5; // Still give daily points
                pointsAwarded = 5;
                user.lastLoginDate = now;
                await user.save();
            }
            // If already logged in today, do nothing.
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.json({
            id: user._id,
            username: user.username,
            role: user.role,
            points: user.points,
            pointsAwarded,
            streak: user.loginStreak,
            streakStatus
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        expires: new Date(0) // Expire immediately
    });
    res.json({ message: 'Logged out successfully' });
};

// Get Auth Status
exports.getStatus = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ authenticated: false });
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.json({ authenticated: false });
        }
        res.json({
            authenticated: true,
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Seed User
exports.seed = async (req, res) => {
    try {
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'adminpassword';
        const email = process.env.ADMIN_EMAIL || 'admin@example.com';

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            username,
            email,
            password,
            role: 'admin'
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Temporary: Reset Admin Password
exports.resetAdmin = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({ username: 'admin' });
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found' });
        }
        user.password = password;
        await user.save();
        res.json({ message: 'Admin password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
