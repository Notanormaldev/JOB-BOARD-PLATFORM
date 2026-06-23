const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection check middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1 && !req.path.startsWith('/uploads') && req.path !== '/api/health') {
    return res.status(503).json({
      message: 'Database is currently offline. Please ensure MongoDB is started locally, or configure your database connection string in the backend/.env file.',
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: mongoose.connection.readyState === 1 ? 'ok' : 'offline', 
    message: 'Job Board API is running',
    databaseConnected: mongoose.connection.readyState === 1
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job-board-platform';

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    console.log('Express Server is running, but MongoDB is offline. Please start your local MongoDB service, or update the MONGO_URI connection string inside backend/.env.');
  });
