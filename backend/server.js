const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
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


app.get('/', (req, res) => {
  res.send('QR Quiz Platform API Running');
});

// Export app for testing
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

