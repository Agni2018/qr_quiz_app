const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const topicRoutes = require('./routes/topics');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('QR Quiz Platform API Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
