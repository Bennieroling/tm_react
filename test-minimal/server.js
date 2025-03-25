const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://wetesttmstorv2.z6.web.core.windows.net');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mock global telemetry endpoint
app.get('/api/telemetry/global', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, country: 'USA', status: 'green' },
      { id: 2, country: 'UK', status: 'yellow' },
      { id: 3, country: 'Germany', status: 'green' }
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
