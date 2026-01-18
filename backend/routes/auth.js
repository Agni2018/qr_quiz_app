const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );
        res.cookie('token', token, {
            httpOnly: true,     // JS cannot access it
            secure: false,      // true in production (HTTPS)
            sameSite: 'lax',    // good default
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ token, username: admin.username });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    });
    res.json({ message: 'Logged out successfully' });
});

// Seed Route (Temporary for setup)
router.post('/seed', async (req, res) => {
    try {
        const adminExists = await Admin.findOne({ username: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const newAdmin = new Admin({
            username: 'admin',
            password: 'adminpassword' // Will be hashed by pre-save hook
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
