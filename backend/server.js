const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
const topicRoutes = require('./routes/topics');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const authRoutes = require('./routes/auth');

app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('QR Quiz Platform API Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
