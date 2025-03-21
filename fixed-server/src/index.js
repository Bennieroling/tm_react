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
app.use(cors({
  origin: ['https://wetesttmstorv2.z6.web.core.windows.net', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Initialize database connection
setupDbConnection();

// Routes
app.use('/api/telemetry', telemetryRouter);
app.use('/api/history', historyRouter);
app.use('/api/phone', phoneRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Telephony Monitor API Server is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /health');
  console.log('- GET /api/telemetry/global');
  console.log('- GET /api/telemetry/country/:countryId');
  console.log('- GET /api/history');
  console.log('- GET /api/history/phone');
  console.log('- GET /api/phone/country/:countryName');
});