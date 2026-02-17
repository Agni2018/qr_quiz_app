const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect Database
const User = require('./models/User');

// Connect Database
connectDB().then(async () => {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    let adminUser = await User.findOne({ username });

    if (adminUser) {
      // Update existing admin
      adminUser.password = password;
      adminUser.role = 'admin'; // Ensure role is admin
      await adminUser.save();
      console.log(`Admin user updated: ${username}`);
    } else {
      // Create new admin
      adminUser = new User({
        username,
        email,
        password,
        role: 'admin'
      });
      await adminUser.save();
      console.log(`Admin user created: ${username}`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api/uploads', express.static('uploads'));



// Prevent caching for all API routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Routes
const topicRoutes = require('./routes/topics');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const badgeRoutes = require('./routes/badges');
const studyMaterialRoutes = require('./routes/studyMaterials');
const messageRoutes = require('./routes/messages');


app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}); app.get('/', (req, res) => {
  res.send('QR Quiz Platform API Running');
});

// Export app for testing
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

