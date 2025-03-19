require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { telemetryRouter } = require('./routes/telemetry');
const { historyRouter } = require('./routes/history');
const { phoneRouter } = require('./routes/phone');
const { setupDbConnection } = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Initialize database connection
setupDbConnection();

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// Routes
app.use('/api/telemetry', telemetryRouter);
app.use('/api/history', historyRouter);
app.use('/api/phone', phoneRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- GET /api/test');
  console.log('- GET /api/telemetry/global');
  console.log('- GET /api/telemetry/country/:countryId');
  console.log('- GET /api/history');
  console.log('- GET /api/phone/country/:country');
});