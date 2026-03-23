const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PendingReferral = require('../models/PendingReferral');
const Message = require('../models/Message');
const Badge = require('../models/Badge');
const challengeController = require('./challengeController');

// Register
exports.register = async (req, res) => {
    try {
        const { username, email, password, referralCode } = req.body;
        const trimmedUsername = username?.trim();
        const trimmedEmail = email?.trim();

        const userExists = await User.findOne({
            $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
        });

        if (userExists) {
            return res.status(400).json({ message: 'User with this username or email already exists' });
        }

        // Generate a unique referral code for the new user
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newUser = new User({
            username: trimmedUsername,
            email: trimmedEmail,
            password,
            role: 'student',
            referralCode: newReferralCode,
            points: 0
        });

        // Handle referral
        if (referralCode) {
            const codeUpper = referralCode.trim().toUpperCase();
            
            // 1. Check for targeted referral first
            const pendingReferral = await PendingReferral.findOne({ referralCode: codeUpper, status: 'pending' });
            
            if (pendingReferral) {
                // Precise case-insensitive match for name and email
                const nameMatch = pendingReferral.targetUsername.trim().toLowerCase() === trimmedUsername.toLowerCase();
                const emailMatch = pendingReferral.targetEmail.trim().toLowerCase() === trimmedEmail.toLowerCase();
                
                if (!nameMatch || !emailMatch) {
                    return res.status(400).json({ 
                        message: "the name and the email doesn't match the referral code" 
                    });
                }

                const referrer = await User.findById(pendingReferral.referrerId);
                if (referrer) {
                    newUser.referredBy = referrer._id;
                    newUser.points += 3; // Referee bonus: 3 points
                    referrer.points += 5; // Referrer bonus: 5 points
                    await referrer.save();

                    // Notify Referrer
                    const referrerMsg = new Message({
                        sender: newUser._id,
                        recipient: referrer._id,
                        text: `Congratulations! You've earned 5 points for referring ${trimmedUsername}.`
                    });

                    // Notify Referee (New User)
                    const refereeMsg = new Message({
                        sender: referrer._id,
                        recipient: newUser._id,
                        text: `Congratulations! You've earned 3 points for being referred by ${referrer.username}.`
                    });

                    await Promise.all([referrerMsg.save(), refereeMsg.save()]);
                    
                    pendingReferral.status = 'completed';
                    await pendingReferral.save();

                    // --- Challenge Progress: Referral ---
                    await challengeController.updateProgress(referrer._id, 'referral_count', 1);
                    await challengeController.updateProgress(referrer._id, 'points_earned', 5);
                    await challengeController.updateProgress(newUser._id, 'points_earned', 3);
                    // ------------------------------------

                    // --- Referral Badge Logic ---
                    const referralCount = await User.countDocuments({ referredBy: referrer._id });
                    const potentialBadges = await Badge.find({ type: 'referral', threshold: { $lte: referralCount } });
                    
                    if (potentialBadges.length > 0) {
                        let badgesAdded = false;
                        for (const badge of potentialBadges) {
                            // Check if user already has this badge
                            const hasBadge = referrer.badges.some(b => b.badgeId.toString() === badge._id.toString());
                            if (!hasBadge) {
                                referrer.badges.push({ badgeId: badge._id });
                                badgesAdded = true;
                            }
                        }
                        if (badgesAdded) {
                            await referrer.save();
                        }
                    }
                    // ----------------------------
                } else {
                    return res.status(400).json({ message: "Referrer no longer exists" });
                }
            } else {
                // 2. Fallback to generic referral code
                const referrer = await User.findOne({ referralCode: codeUpper });
                if (referrer) {
                    newUser.referredBy = referrer._id;
                    newUser.points += 3;
                    referrer.points += 5;
                    await referrer.save();

                    // --- Challenge Progress: Referral (Generic) ---
                    await challengeController.updateProgress(referrer._id, 'referral_count', 1);
                    await challengeController.updateProgress(referrer._id, 'points_earned', 5);
                    await challengeController.updateProgress(newUser._id, 'points_earned', 3);
                    // ----------------------------------------------

                    // --- Referral Badge Logic (Generic) ---
                    const referralCount = await User.countDocuments({ referredBy: referrer._id });
                    const potentialBadges = await Badge.find({ type: 'referral', threshold: { $lte: referralCount } });
                    
                    if (potentialBadges.length > 0) {
                        let badgesAdded = false;
                        for (const badge of potentialBadges) {
                            const hasBadge = referrer.badges.some(b => b.badgeId.toString() === badge._id.toString());
                            if (!hasBadge) {
                                referrer.badges.push({ badgeId: badge._id });
                                badgesAdded = true;
                            }
                        }
                        if (badgesAdded) {
                            await referrer.save();
                        }
                    }
                    // --------------------------------------
                } else {
                    // 3. Invalid code provided
                    return res.status(400).json({ message: "Invalid referral code" });
                }
            }
        }

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', referralCode: newReferralCode });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const trimmedUsername = username?.trim();
        const user = await User.findOne({ username: trimmedUsername });

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
            user.points += 2; // Award daily points on first login too
            pointsAwarded = 2;
            await user.save();

            // --- Challenge Progress: First Login ---
            await challengeController.updateProgress(user._id, 'points_earned', 2);
            await challengeController.updateProgress(user._id, 'streak', 1);
            // ----------------------------------------
        } else {
            const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
            const todayDate = new Date(now).setHours(0, 0, 0, 0);
            const diffInDays = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));

            if (diffInDays === 1) {
                // Consecutive login
                user.loginStreak += 1;
                user.points += 2; // Daily login points
                pointsAwarded = 2;

                // Streak milestone every 7 days
                if (user.loginStreak % 7 === 0) {
                    user.points += 10; // Scaled down streak bonus (optional, keeping it proportional)
                    pointsAwarded += 10;
                    streakStatus = `7-day streak! +10 bonus points!`;
                }
                user.lastLoginDate = now;
                await user.save();

                // --- Challenge Progress: Daily Login ---
                await challengeController.updateProgress(user._id, 'points_earned', 2);
                await challengeController.updateProgress(user._id, 'streak', 1);
                if (user.loginStreak % 7 === 0) {
                    await challengeController.updateProgress(user._id, 'points_earned', 10);
                }
                // ---------------------------------------
            } else if (diffInDays > 1) {
                // Streak broken
                user.loginStreak = 1;
                user.points += 2; // Still give daily points
                pointsAwarded = 2;
                user.lastLoginDate = now;
                await user.save();

                // --- Challenge Progress: New Streak Start ---
                await challengeController.updateProgress(user._id, 'points_earned', 2);
                await challengeController.updateProgress(user._id, 'streak', 1);
                // --------------------------------------------
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
        res.cookie('userRole', user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        // Level up logic
        const currentLevel = Math.min(Math.floor((user.points || 0) / 50) + 1, 11);
        let levelUp = null;
        if (currentLevel > (user.lastSeenLevel || 1)) {
            levelUp = {
                old: user.lastSeenLevel || 1,
                new: currentLevel
            };
            console.log(`[LevelUp] User ${user.username} leveled up:`, levelUp);
            user.lastSeenLevel = currentLevel;
            await user.save();
        }

        res.json({
            id: user._id,
            username: user.username,
            role: user.role,
            points: user.points,
            pointsAwarded,
            streak: user.loginStreak,
            streakStatus,
            currentLevel,
            levelUp
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
    res.cookie('userRole', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        expires: new Date(0)
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

        // Level up logic for status check
        const currentLevel = Math.min(Math.floor((user.points || 0) / 50) + 1, 11);
        let levelUp = null;
        if (currentLevel > (user.lastSeenLevel || 1)) {
            levelUp = {
                old: user.lastSeenLevel || 1,
                new: currentLevel
            };
            console.log(`[Status LevelUp] User ${user.username} leveled up:`, levelUp);
            user.lastSeenLevel = currentLevel;
            await user.save();
        }
        
        console.log(`[Status Check] User ${user.username}, levelUp:`, levelUp);

        res.json({
            authenticated: true,
            user: {
                ...user.toObject(),
                currentLevel,
                levelUp
            }
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

// Create Targeted Referral
exports.createReferral = async (req, res) => {
    try {
        const { username, email } = req.body;
        const referrerId = req.user.id;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const pendingReferral = new PendingReferral({
            referrerId,
            targetUsername: username.trim(),
            targetEmail: email.trim().toLowerCase(),
            referralCode
        });

        await pendingReferral.save();

        res.status(201).json({
            message: 'Referral created successfully',
            referralCode
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Referral with this unique code already exists. Please try again.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get My Referrals
exports.getMyReferrals = async (req, res) => {
    try {
        const referrerId = req.user.id;
        const referrals = await PendingReferral.find({ referrerId }).sort({ createdAt: -1 });
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
